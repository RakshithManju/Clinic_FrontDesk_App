import { SignJWT, jwtVerify, generateKeyPair, exportJWK, type JWTPayload } from "jose"
import crypto from "crypto"
import type { UserPayload } from "./types"

// Cookie names
export const ACCESS_COOKIE = "fd_at"
export const REFRESH_COOKIE = "fd_rt"

// TTLs
const ACCESS_TTL_SECONDS = 10 * 60 // 10 minutes
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60 // 7 days

// Globals (preview): RSA keypair and JWKS
type KeyState = {
  privateKey: crypto.KeyObject | CryptoKey
  publicKey: crypto.KeyObject | CryptoKey
  jwk: any
  kid: string
}
const g = globalThis as unknown as { __fd_keys?: KeyState }
async function initKeys(): Promise<KeyState> {
  if (g.__fd_keys) return g.__fd_keys
  const { publicKey, privateKey } = await generateKeyPair("RS256")
  const jwk = await exportJWK(publicKey)
  const kid = crypto.createHash("sha256").update(JSON.stringify(jwk)).digest("hex").slice(0, 16)
  g.__fd_keys = { privateKey, publicKey, jwk: { ...jwk, kid, alg: "RS256", use: "sig" }, kid }
  return g.__fd_keys!
}

export async function getJWKS() {
  const ks = await initKeys()
  return { keys: [ks.jwk] }
}

async function signAccessToken(user: UserPayload) {
  const ks = await initKeys()
  const now = Math.floor(Date.now() / 1000)
  return await new SignJWT({ email: user.email, role: user.role } as JWTPayload)
    .setProtectedHeader({ alg: "RS256", kid: ks.kid })
    .setSubject(user.sub)
    .setAudience("api")
    .setIssuedAt(now)
    .setExpirationTime(now + ACCESS_TTL_SECONDS)
    .sign(ks.privateKey as any)
}

export async function verifyAccessToken(token: string) {
  const ks = await initKeys()
  const { payload } = await jwtVerify(token, ks.publicKey as any, { audience: "api" })
  return payload as unknown as {
    sub: string
    email: string
    role: "frontdesk" | "admin"
    iat: number
    exp: number
    aud: string
  }
}

// Cookie helpers
function cookieOpts({ maxAge }: { maxAge: number }) {
  // HttpOnly, Secure (works in https), SameSite=Lax for app flows
  return `Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`
}

export function setAccessCookie(token: string) {
  return `${ACCESS_COOKIE}=${encodeURIComponent(token)}; ${cookieOpts({ maxAge: ACCESS_TTL_SECONDS })}`
}

export function setRefreshCookie(rt: string) {
  return `${REFRESH_COOKIE}=${encodeURIComponent(rt)}; ${cookieOpts({ maxAge: REFRESH_TTL_SECONDS })}; Secure`
}

export function clearAuthCookies() {
  const past = "Max-Age=0"
  return [
    `${ACCESS_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; ${past}`,
    `${REFRESH_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; ${past}`,
  ]
}

export function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {}
  if (!header) return out
  header.split(";").forEach((c) => {
    const [k, ...v] = c.trim().split("=")
    out[k] = decodeURIComponent(v.join("="))
  })
  return out
}

export function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex")
}

export function makeRandomToken(bytes = 48) {
  return crypto.randomBytes(bytes).toString("base64url")
}

// Auth context from request cookies
export async function getUserFromRequest(req: Request) {
  const cookieHeader = req.headers.get("cookie")
  const cookies = parseCookies(cookieHeader)
  const at = cookies[ACCESS_COOKIE]
  if (!at) return null
  try {
    const payload = await verifyAccessToken(at)
    return { id: payload.sub, email: payload.email, role: payload.role }
  } catch {
    return null
  }
}

export async function requireAuth(req: Request) {
  const user = await getUserFromRequest(req)
  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }
  return user
}
