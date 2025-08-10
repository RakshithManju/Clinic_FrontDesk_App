import { requireAuth } from "@/lib/auth"
import { query, exec } from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const doctorId = searchParams.get("doctorId")
  const where: string[] = ["clinic_id = 1"]
  const params: any[] = []
  if (doctorId) {
    where.push("doctor_id = ?")
    params.push(Number(doctorId))
  }
  const rows = await query<any>(
    `SELECT id, patient_id, doctor_id, start_time, end_time, status, created_at
     FROM appointments
     WHERE ${where.join(" AND ")}
     ORDER BY start_time ASC`,
    params,
  )
  // Join patient names
  let patients: Record<number, { first_name: string; last_name: string }> = {}
  if (rows.length) {
    const ids = Array.from(new Set(rows.map((r) => r.patient_id)))
    const pRows = await query<any>(
      `SELECT id, first_name, last_name FROM patients WHERE id IN (${ids.map(() => "?").join(",")})`,
      ids,
    )
    patients = Object.fromEntries(pRows.map((p) => [p.id, { first_name: p.first_name, last_name: p.last_name }]))
  }
  const appointments = rows.map((r) => ({
    id: String(r.id),
    patientName: `${patients[r.patient_id]?.first_name || "Patient"} ${patients[r.patient_id]?.last_name || ""}`.trim(),
    doctorId: String(r.doctor_id),
    timeISO: (() => {
      const date = new Date(r.start_time)
      return isNaN(date.getTime()) ? null : date.toISOString()
    })(),
    status: mapStatus(r.status),
    createdAt: (() => {
      const date = new Date(r.created_at)
      return isNaN(date.getTime()) ? null : date.toISOString()
    })(),
  }))
  return Response.json({ appointments })
}

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  try {
    const body = await request.json()
    const { patientName, doctorId, timeISO } = body || {}
    if (!patientName || !doctorId || !timeISO) return new Response("Missing fields", { status: 400 })
    const start = new Date(timeISO)
    const end = new Date(start.getTime() + 30 * 60 * 1000) // 30 min default

    // Create patient quick-add
    const [first, ...rest] = String(patientName).trim().split(" ")
    const last = rest.join(" ")
    const pRes = await query<any>(
      "SELECT id FROM patients WHERE clinic_id = 1 AND first_name = ? AND last_name = ? ORDER BY id DESC LIMIT 1",
      [first || "Unknown", last || ""],
    )
    let patientId = pRes[0]?.id
    if (!patientId) {
      const ins = await query<any>(
        "INSERT INTO patients (clinic_id, first_name, last_name, created_at) VALUES (1, ?, ?, NOW())",
        [first || "Unknown", last || ""],
      )
      // mysql2 execute returns OkPacket, use separate query to fetch last id if needed
      const lastIdRow = await query<any>("SELECT LAST_INSERT_ID() as id")
      patientId = lastIdRow[0].id
    }

    // Verify not taken
    const conflicts = await query<any>(
      "SELECT id FROM appointments WHERE doctor_id = ? AND start_time = ? AND status = 'BOOKED' LIMIT 1",
      [Number(doctorId), format(start)],
    )
    if (conflicts.length) return new Response("Timeslot already booked", { status: 400 })

    await exec(
      "INSERT INTO appointments (clinic_id, patient_id, doctor_id, start_time, end_time, status, source, created_at) VALUES (1, ?, ?, ?, ?, 'BOOKED', 'FRONT_DESK', NOW())",
      [patientId, Number(doctorId), format(start), format(end)],
    )

    // Return latest appointment
    const rows = await query<any>(
      `SELECT a.id, a.patient_id, a.doctor_id, a.start_time, a.status, a.created_at, p.first_name, p.last_name
       FROM appointments a JOIN patients p ON p.id = a.patient_id
       WHERE a.doctor_id = ? AND a.start_time = ? LIMIT 1`,
      [Number(doctorId), format(start)],
    )
    const a = rows[0]
    return Response.json(
      {
        appointment: {
          id: String(a.id),
          patientName: `${a.first_name} ${a.last_name}`.trim(),
          doctorId: String(a.doctor_id),
          timeISO: (() => {
            const date = new Date(a.start_time)
            return isNaN(date.getTime()) ? null : date.toISOString()
          })(),
          status: mapStatus(a.status),
          createdAt: (() => {
            const date = new Date(a.created_at)
            return isNaN(date.getTime()) ? null : date.toISOString()
          })(),
        },
      },
      { status: 201 },
    )
  } catch (e: any) {
    return new Response(e?.message || "Invalid request", { status: 400 })
  }
}

function mapStatus(s: string) {
  const m: Record<string, string> = {
    BOOKED: "booked",
    RESCHEDULED: "rescheduled",
    CANCELED: "canceled",
    COMPLETED: "completed",
    NO_SHOW: "no-show",
  }
  return m[s] || "booked"
}
function format(d: Date) {
  return d.toISOString().slice(0, 19).replace("T", " ")
}
