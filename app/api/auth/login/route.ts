import { setAccessCookie, setRefreshCookie, hashToken, makeRandomToken } from "@/lib/auth"
import type { UserPayload } from "@/lib/types"
import { query, exec } from "@/lib/db"
import bcrypt from "bcryptjs"

function toUserPayload(row: any): UserPayload {
  return {
    sub: String(row.id),
    email: row.email,
    role: Array.isArray(row.roles) ? (row.roles.includes("ADMIN") ? "admin" : "frontdesk") : "frontdesk",
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body || {}
    if (!email || !password) return new Response("Email and password required", { status: 400 })

    // Fetch user
    const users = await query<any>(
      "SELECT id, email, password_hash, roles, is_active FROM users WHERE email = ? LIMIT 1",
      [email],
    )
    if (users.length === 0) return new Response("Invalid credentials", { status: 401 })
    const userRow = users[0]
    if (!userRow.is_active) return new Response("User inactive", { status: 403 })

    // Roles might come back as stringified JSON depending on MySQL driver config; normalize to array
    try {
      if (typeof userRow.roles === "string") userRow.roles = JSON.parse(userRow.roles)
    } catch {
      userRow.roles = ["FRONT_DESK"]
    }

    const hash: string = userRow.password_hash || ""
    let ok = false
    if (hash && hash.startsWith("$2")) {
      ok = await bcrypt.compare(password, hash)
    } else {
      // Fallback for placeholder seed; allow demo password "frontdesk123"
      ok = password === "frontdesk123"
    }
    if (!ok) return new Response("Invalid credentials", { status: 401 })

    const user: UserPayload = toUserPayload(userRow)
    const { signAccessToken } = await import("@/lib/auth")
    const at = await signAccessToken(user)
    const rt = makeRandomToken()
    const tokenHash = hashToken(rt)
    const now = new Date()
    const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    // Save refresh token
    await execSaveRefreshToken({
      tokenHash,
      userId: Number(user.sub),
      issuedAt: now,
      expiresAt: expires,
      deviceId: "web",
    })

    const headers = new Headers({
      "set-cookie": [setAccessCookie(at), setRefreshCookie(rt)].join(", "),
      "content-type": "application/json",
    })
    return new Response(JSON.stringify({ user: { id: user.sub, email: user.email, role: user.role } }), { headers })
  } catch (e: any) {
    return new Response(e?.message || "Bad request", { status: 400 })
  }
}

async function execSaveRefreshToken({
  tokenHash,
  userId,
  issuedAt,
  expiresAt,
  deviceId,
}: {
  tokenHash: string
  userId: number
  issuedAt: Date
  expiresAt: Date
  deviceId?: string
}) {
  await exec(
    "INSERT INTO refresh_tokens (token_hash, user_id, device_id, issued_at, expires_at, revoked, last_used_at) VALUES (?,?,?,?,?,0,?)",
    [
      tokenHash,
      userId,
      deviceId || null,
      formatMySQLDate(issuedAt),
      formatMySQLDate(expiresAt),
      formatMySQLDate(issuedAt),
    ],
  )
}

function formatMySQLDate(d: Date) {
  return d.toISOString().slice(0, 19).replace("T", " ")
}
