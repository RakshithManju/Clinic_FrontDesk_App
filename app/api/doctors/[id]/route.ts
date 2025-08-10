import { requireAuth } from "@/lib/auth"
import { txn } from "@/lib/db"
import type { Doctor } from "@/lib/types"

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth
  const id = Number(context.params.id)
  const patch = (await request.json()) as Partial<Doctor>

  await txn(async (conn) => {
    if (patch.name || patch.specialization || patch.gender || patch.location || typeof patch.active !== "undefined") {
      await conn.execute(
        "UPDATE doctors SET name = COALESCE(?, name), specialization = COALESCE(?, specialization), gender = COALESCE(?, gender), location = COALESCE(?, location), is_active = COALESCE(?, is_active) WHERE id = ?",
        [
          patch.name || null,
          patch.specialization || null,
          patch.gender || null,
          patch.location || null,
          typeof patch.active === "boolean" ? (patch.active ? 1 : 0) : null,
          id,
        ],
      )
    }
    if (Array.isArray(patch.availability)) {
      await conn.execute("DELETE FROM doctor_schedules WHERE doctor_id = ?", [id])
      for (const a of patch.availability) {
        await conn.execute(
          "INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_len_minutes, is_active) VALUES (?,?,?,?,30,1)",
          [id, a.day, a.start, a.end],
        )
      }
    }
  })

  return Response.json({ doctor: { ...patch, id: String(id) } })
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth
  const id = Number(context.params.id)
  try {
    await txn(async (conn) => {
      await conn.execute("DELETE FROM doctor_schedules WHERE doctor_id = ?", [id])
      await conn.execute("DELETE FROM doctors WHERE id = ?", [id])
    })
    return new Response(null, { status: 204 })
  } catch (e: any) {
    // Likely FK constraint due to appointments
    return new Response("Doctor has related records", { status: 409 })
  }
}
