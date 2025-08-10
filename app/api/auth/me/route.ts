import { getUserFromRequest, parseCookies, setAccessCookie, hashToken } from "@/lib/auth"
import { query } from "@/lib/db"

export async function GET(request: Request) {
  // Try access token first
  const user = await getUserFromRequest(request)
  if (user) return Response.json({ user })

  // Fallback: if refresh token exists and valid, mint a new access token
  const cookies = parseCookies(request.headers.get("cookie"))
  const rt = cookies["fd_rt"]
  if (!rt) return new Response("Unauthorized", { status: 401 })

  const recs = await query<any>(
    "SELECT token_hash, user_id, revoked, expires_at FROM refresh_tokens WHERE token_hash = ? LIMIT 1",
    [hashToken(rt)],
  )
  if (recs.length === 0) return new Response("Unauthorized", { status: 401 })
  const rec = recs[0]
  if (rec.revoked || new Date(rec.expires_at).getTime() < Date.now())
    return new Response("Unauthorized", { status: 401 })

  const users = await query<any>("SELECT id, email, roles FROM users WHERE id = ? LIMIT 1", [rec.user_id])
  if (users.length === 0) return new Response("Unauthorized", { status: 401 })
  const userRow = users[0]
  try {
    if (typeof userRow.roles === "string") userRow.roles = JSON.parse(userRow.roles)
  } catch {}
  const userPayload = {
    sub: String(userRow.id),
    email: userRow.email,
    role: Array.isArray(userRow.roles) && userRow.roles.includes("ADMIN") ? "admin" : "frontdesk",
  } as const
  const { signAccessToken } = await import("@/lib/auth")
  const at = await signAccessToken(userPayload)
  const headers = new Headers({ "set-cookie": setAccessCookie(at), "content-type": "application/json" })
  return new Response(
    JSON.stringify({ user: { id: userPayload.sub, email: userPayload.email, role: userPayload.role } }),
    {
      headers,
    },
  )
}
