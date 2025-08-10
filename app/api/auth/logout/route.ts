import { clearAuthCookies, parseCookies, hashToken } from "@/lib/auth"
import { exec } from "@/lib/db"

export async function POST(request: Request) {
  const cookies = parseCookies(request.headers.get("cookie"))
  const rt = cookies["fd_rt"]
  if (rt) {
    await exec("UPDATE refresh_tokens SET revoked = 1, last_used_at = NOW() WHERE token_hash = ?", [hashToken(rt)])
  }
  const headers = new Headers({ "set-cookie": clearAuthCookies().join(", ") })
  return new Response(null, { status: 204, headers })
}
