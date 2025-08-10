import { requireAuth } from "@/lib/auth"
import { query, txn } from "@/lib/db"
import type { Doctor } from "@/lib/types"

function toAvailability(rows: any[]) {
  return rows.map((r) => ({
    day: Number(r.day_of_week),
    start: r.start_time.slice(0, 5), // HH:MM
    end: r.end_time.slice(0, 5),
  }))
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = (searchParams.get("search") || "").trim()
  const specialization = searchParams.get("specialization")
  const location = searchParams.get("location")

  const where: string[] = ["clinic_id = 1"]
  const params: any[] = []
  if (search) {
    where.push("(LOWER(name) LIKE ? OR LOWER(specialization) LIKE ? OR LOWER(location) LIKE ?)")
    const like = `%${search.toLowerCase()}%`
    params.push(like, like, like)
  }
  if (specialization) {
    where.push("specialization = ?")
    params.push(specialization)
  }
  if (location) {
    where.push("location = ?")
    params.push(location)
  }
  const doctors = await query<any>(
    `SELECT id, name, specialization, gender, location, is_active
     FROM doctors
     WHERE ${where.join(" AND ")}
     ORDER BY id DESC`,
    params,
  )
  const ids = doctors.map((d) => d.id)
  let schedules: any[] = []
  if (ids.length) {
    schedules = await query<any>(
      `SELECT doctor_id, day_of_week, TIME_FORMAT(start_time, '%H:%i') as start_time, TIME_FORMAT(end_time, '%H:%i') as end_time
       FROM doctor_schedules WHERE doctor_id IN (${ids.map(() => "?").join(",")}) AND is_active = 1`,
      ids,
    )
  }
  const byDoc: Record<number, any[]> = {}
  schedules.forEach((s) => {
    byDoc[s.doctor_id] = byDoc[s.doctor_id] || []
    byDoc[s.doctor_id].push(s)
  })

  const output = doctors.map((d) => ({
    id: String(d.id),
    name: d.name,
    specialization: d.specialization,
    gender: d.gender,
    location: d.location,
    active: !!d.is_active,
    availability: toAvailability(byDoc[d.id] || []),
  }))
  return Response.json({ doctors: output })
}

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof Response) return auth

  const body = (await request.json()) as Doctor
  if (!body.name) return new Response("Name is required", { status: 400 })

  const result = await txn(async (conn) => {
    const [ins] = await conn.execute(
      "INSERT INTO doctors (clinic_id, name, specialization, gender, location, is_active) VALUES (1,?,?,?,?,?)",
      [body.name, body.specialization, body.gender, body.location, body.active ? 1 : 1],
    )
    // @ts-ignore
    const doctorId = Number(ins.insertId)
    if (Array.isArray(body.availability)) {
      for (const a of body.availability) {
        await conn.execute(
          "INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_len_minutes, is_active) VALUES (?,?,?,?,30,1)",
          [doctorId, a.day, a.start, a.end],
        )
      }
    }
    return doctorId
  })

  const doctor = {
    id: String(result),
    name: body.name,
    specialization: body.specialization,
    gender: body.gender,
    location: body.location,
    availability: body.availability || [],
    active: true,
  }
  return Response.json({ doctor }, { status: 201 })
}
