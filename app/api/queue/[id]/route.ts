import { requireAuth } from "@/lib/auth"
import { exec } from "@/lib/db"

function toDbStatus(ui: string): string {
  const m: Record<string, string> = {
    waiting: "WAITING",
    "with-doctor": "WITH_DOCTOR",
    completed: "COMPLETED",
    "no-show": "NO_SHOW",
    canceled: "CANCELED",
  }
  return m[ui] || "WAITING"
}
function toDbPriority(ui: string): string {
  return ui === "urgent" ? "URGENT" : "NORMAL"
}

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth
  const id = Number(context.params.id)
  const patch = (await request.json()) as any
  const fields: string[] = []
  const params: any[] = []
  if (patch.status) {
    fields.push("status = ?")
    params.push(toDbStatus(patch.status))
  }
  if (patch.priority) {
    fields.push("priority = ?")
    params.push(toDbPriority(patch.priority))
  }
  if (typeof patch.doctorId !== "undefined") {
    fields.push("assigned_doctor_id = ?")
    params.push(patch.doctorId ? Number(patch.doctorId) : null)
  }
  if (!fields.length) return new Response("No updates", { status: 400 })
  params.push(id)
  await exec(`UPDATE queue_entries SET ${fields.join(", ")} WHERE id = ?`, params)
  return Response.json({ entry: { id: String(id) } })
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth
  await exec("DELETE FROM queue_entries WHERE id = ?", [Number(context.params.id)])
  return new Response(null, { status: 204 })
}
