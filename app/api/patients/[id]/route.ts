import { requireAuth } from "@/lib/auth"
import { exec } from "@/lib/db"

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth
  const id = Number(context.params.id)
  const patch = (await request.json()) as any
  await exec(
    "UPDATE patients SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name), phone = COALESCE(?, phone), email = COALESCE(?, email) WHERE id = ?",
    [patch.firstName || null, patch.lastName || null, patch.phone || null, patch.email || null, id],
  )
  return Response.json({ patient: { id: String(id), ...patch } })
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth
  await exec("DELETE FROM patients WHERE id = ?", [Number(context.params.id)])
  return new Response(null, { status: 204 })
}
