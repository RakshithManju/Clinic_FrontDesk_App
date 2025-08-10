import { parseCookies, setAccessCookie, setRefreshCookie, hashToken, makeRandomToken } from "@/lib/auth"
import type { UserPayload } from "@/lib/types"
import { query, txn } from "@/lib/db"

export async function POST(request: Request) {
  const cookies = parseCookies(request.headers.get("cookie"))
  const rt = cookies["fd_rt"]
  if (!rt) return new Response("No refresh token", { status: 401 })
  const hash = hashToken(rt)

  const recs = await query<any>(
    "SELECT token_hash, user_id, revoked, expires_at FROM refresh_tokens WHERE token_hash = ? LIMIT 1",
    [hash],
  )
  if (recs.length === 0) return new Response("Invalid refresh", { status: 401 })
  const rec = recs[0]
  if (rec.revoked || new Date(rec.expires_at).getTime() < Date.now())
    return new Response("Invalid refresh", { status: 401 })

  // Rotate token in a transaction
  const newRt = makeRandomToken()
  const newHash = hashToken(newRt)
  const now = new Date()
  const newExp = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  await txn(async (conn) => {
    await conn.execute("UPDATE refresh_tokens SET revoked = 1, last_used_at = ? WHERE token_hash = ?", [
      format(now),
      hash,
    ])
    await conn.execute(
      "INSERT INTO refresh_tokens (token_hash, user_id, device_id, issued_at, expires_at, revoked, last_used_at) VALUES (?,?,?,?,?,0,?)",
      [newHash, rec.user_id, "web", format(now), format(newExp), format(now)],
    )
  })

  // Load user
  const users = await query<any>("SELECT id, email, roles FROM users WHERE id = ? LIMIT 1", [rec.user_id])
  if (users.length === 0) return new Response("Invalid user", { status: 401 })
  const userRow = users[0]
  try {
    if (typeof userRow.roles === "string") userRow.roles = JSON.parse(userRow.roles)
  } catch {}
  const user: UserPayload = {
    sub: String(userRow.id),
    email: userRow.email,
    role: Array.isArray(userRow.roles) && userRow.roles.includes("ADMIN") ? "admin" : "frontdesk",
  }
  const { signAccessToken } = await import("@/lib/auth")
  const at = await signAccessToken(user)

  const headers = new Headers({
    "set-cookie": [setAccessCookie(at), setRefreshCookie(newRt)].join(", "),
    "content-type": "application/json",
  })
  return new Response(JSON.stringify({ ok: true }), { headers })
}

function format(d: Date) {
  return d.toISOString().slice(0, 19).replace("T", " ")
}
