import { requireAuth } from "@/lib/auth"
import { query, txn } from "@/lib/db"

function mapStatus(dbStatus: string): any {
  const m: Record<string, string> = {
    WAITING: "waiting",
    WITH_DOCTOR: "with-doctor",
    COMPLETED: "completed",
    NO_SHOW: "no-show",
    CANCELED: "canceled",
  }
  return m[dbStatus] || "waiting"
}
function mapPriority(dbPriority: string): any {
  return dbPriority === "URGENT" ? "urgent" : "normal"
}

export async function GET() {
  const rows = await query<any>(
    `SELECT q.id, q.queue_number, q.status, q.priority, q.assigned_doctor_id,
            q.arrival_time, p.first_name, p.last_name
     FROM queue_entries q
     JOIN patients p ON p.id = q.patient_id
     WHERE q.clinic_id = 1
     ORDER BY q.arrival_time ASC`,
  )
  const queue = rows.map((r) => ({
    id: String(r.id),
    queueNumber: Number(r.queue_number),
    patientName: `${r.first_name} ${r.last_name}`.trim(),
    status: mapStatus(r.status),
    priority: mapPriority(r.priority),
    doctorId: r.assigned_doctor_id ? String(r.assigned_doctor_id) : null,
    createdAt: new Date(r.arrival_time).toISOString(),
  }))
  return Response.json({ queue })
}

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  const body = await request.json()
  if (!body?.patientName) return new Response("Patient name required", { status: 400 })
  const doctorId = body.doctorId ? Number(body.doctorId) : null
  const priority = body.priority === "urgent" ? "URGENT" : "NORMAL"

  const id = await txn(async (conn) => {
    // Quick add patient if needed
    const [firstName, ...rest] = String(body.patientName).trim().split(" ")
    const lastName = rest.join(" ")
    const [pIns] = await conn.execute(
      "INSERT INTO patients (clinic_id, first_name, last_name, created_at) VALUES (1,?,?, NOW())",
      [firstName || "Unknown", lastName || ""],
    )
    // @ts-ignore
    const patientId = Number(pIns.insertId)

    // Next queue number for today
    const [r] = await conn.query<any[]>(
      "SELECT COALESCE(MAX(queue_number),0)+1 AS nextNum FROM queue_entries WHERE clinic_id=1 AND DATE(arrival_time)=CURDATE()",
    )
    const nextNum = Number((r as any)[0].nextNum || 1)

    const [qIns] = await conn.execute(
      "INSERT INTO queue_entries (clinic_id, patient_id, queue_number, status, priority, assigned_doctor_id, arrival_time, created_at) VALUES (1, ?, ?, 'WAITING', ?, ?, NOW(), NOW())",
      [patientId, nextNum, priority, doctorId],
    )
    // @ts-ignore
    const queueId = Number(qIns.insertId)
    return queueId
  })

  const rows = await query<any>(
    `SELECT q.id, q.queue_number, q.status, q.priority, q.assigned_doctor_id, q.arrival_time, p.first_name, p.last_name
     FROM queue_entries q JOIN patients p ON p.id=q.patient_id WHERE q.id = ?`,
    [id],
  )
  const q = rows[0]
  return Response.json(
    {
      entry: {
        id: String(q.id),
        queueNumber: Number(q.queue_number),
        patientName: `${q.first_name} ${q.last_name}`.trim(),
        status: mapStatus(q.status),
        priority: mapPriority(q.priority),
        doctorId: q.assigned_doctor_id ? String(q.assigned_doctor_id) : null,
        createdAt: new Date(q.arrival_time).toISOString(),
      },
    },
    { status: 201 },
  )
}
