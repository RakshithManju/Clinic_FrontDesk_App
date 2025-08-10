import { getJWKS } from "@/lib/auth"

export async function GET() {
  const jwks = await getJWKS()
  return new Response(JSON.stringify(jwks), {
    headers: { "content-type": "application/json", "cache-control": "public, max-age=300, must-revalidate" },
  })
}
