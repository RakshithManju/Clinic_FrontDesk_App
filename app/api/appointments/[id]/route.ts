import { requireAuth } from "@/lib/auth"
import { exec, query } from "@/lib/db"

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  try {
    const id = Number(context.params.id)
    const patch = await request.json()
    if (!patch.timeISO && !patch.doctorId) return new Response("Nothing to update", { status: 400 })

    // Load current
    const rows = await query<any>("SELECT doctor_id FROM appointments WHERE id = ? LIMIT 1", [id])
    if (!rows.length) return new Response("Not found", { status: 404 })
    const currentDoctorId = Number(rows[0].doctor_id)

    const newDoctorId = patch.doctorId ? Number(patch.doctorId) : currentDoctorId
    const newStart = patch.timeISO ? new Date(patch.timeISO) : null
    const newEnd = newStart ? new Date(newStart.getTime() + 30 * 60 * 1000) : null

    if (newStart) {
      const conflicts = await query<any>(
        "SELECT id FROM appointments WHERE doctor_id = ? AND start_time = ? AND status = 'BOOKED' AND id <> ? LIMIT 1",
        [newDoctorId, format(newStart), id],
      )
      if (conflicts.length) return new Response("Timeslot already booked", { status: 400 })
    }

    const sets: string[] = []
    const params: any[] = []
    if (patch.doctorId) {
      sets.push("doctor_id = ?")
      params.push(newDoctorId)
    }
    if (newStart && newEnd) {
      sets.push("start_time = ?", "end_time = ?")
      params.push(format(newStart), format(newEnd))
    }
    if (!sets.length) return new Response("Nothing to update", { status: 400 })

    await exec(`UPDATE appointments SET ${sets.join(", ")}, status='BOOKED', updated_at = NOW() WHERE id = ?`, [
      ...params,
      id,
    ])
    const updated = await query<any>(
      "SELECT id, doctor_id, start_time, status, created_at FROM appointments WHERE id = ?",
      [id],
    )
    const a = updated[0]
    return Response.json({
      appointment: {
        id: String(a.id),
        doctorId: String(a.doctor_id),
        timeISO: new Date(a.start_time).toISOString(),
        status: "booked",
        createdAt: new Date(a.created_at).toISOString(),
      },
    })
  } catch (e: any) {
    return new Response(e?.message || "Invalid request", { status: 400 })
  }
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth
  await exec("UPDATE appointments SET status = 'CANCELED', updated_at = NOW() WHERE id = ?", [
    Number(context.params.id),
  ])
  return new Response(null, { status: 204 })
}

function format(d: Date) {
  return d.toISOString().slice(0, 19).replace("T", " ")
}
