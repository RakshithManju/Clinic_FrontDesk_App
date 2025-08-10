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
    const { email, password, firstName, lastName } = body || {}
    
    // Validation
    if (!email || !password || !firstName || !lastName) {
      return new Response("Email, password, first name, and last name are required", { status: 400 })
    }
    
    if (password.length < 8) {
      return new Response("Password must be at least 8 characters long", { status: 400 })
    }
    
    if (!isValidEmail(email)) {
      return new Response("Please provide a valid email address", { status: 400 })
    }

    // Check if user already exists
    const existingUsers = await query<any>(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    )
    if (existingUsers.length > 0) {
      return new Response("User with this email already exists", { status: 409 })
    }

    // Get default clinic_id (assuming single clinic for now)
    const clinics = await query<any>("SELECT id FROM clinics LIMIT 1")
    if (clinics.length === 0) {
      return new Response("No clinic configured", { status: 500 })
    }
    const clinicId = clinics[0].id

    // Hash password
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)
    
    // Create user with frontdesk role by default
    const roles = JSON.stringify(["FRONT_DESK"])
    
    const result = await query<any>(
      `INSERT INTO users (clinic_id, email, username, password_hash, roles, is_active) 
       VALUES (?, ?, ?, ?, ?, 1)`,
      [clinicId, email, `${firstName} ${lastName}`, passwordHash, roles]
    )
    
    if (!result || !result.insertId) {
      return new Response("Failed to create user", { status: 500 })
    }

    // Create UserPayload for the new user
    const newUser: UserPayload = {
      sub: String(result.insertId),
      email: email,
      role: "frontdesk"
    }

    // Generate tokens
    const { signAccessToken } = await import("@/lib/auth")
    const at = await signAccessToken(newUser)
    const rt = makeRandomToken()
    const tokenHash = hashToken(rt)
    const now = new Date()
    const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    // Save refresh token
    await execSaveRefreshToken({
      tokenHash,
      userId: Number(newUser.sub),
      issuedAt: now,
      expiresAt: expires,
      deviceId: "web",
    })

    const headers = new Headers({
      "set-cookie": [setAccessCookie(at), setRefreshCookie(rt)].join(", "),
      "content-type": "application/json",
    })
    
    return new Response(
      JSON.stringify({ 
        user: { 
          id: newUser.sub, 
          email: newUser.email, 
          role: newUser.role 
        } 
      }), 
      { headers }
    )
  } catch (e: any) {
    console.error("Registration error:", e)
    return new Response(e?.message || "Registration failed", { status: 500 })
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
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
    ]
  )
}

function formatMySQLDate(d: Date) {
  return d.toISOString().slice(0, 19).replace("T", " ")
}
