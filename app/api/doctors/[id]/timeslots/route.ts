import { query } from "@/lib/db"

export async function GET(request: Request, context: { params: { id: string } }) {
  const { searchParams } = new URL(request.url)
  const doctorId = Number(context.params.id)
  const dateStr = searchParams.get("date") // YYYY-MM-DD
  const days = Number(searchParams.get("days") || "1")
  // Parse date string safely in UTC to avoid timezone issues
  const start = dateStr ? (() => {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0))
  })() : new Date()
  const now = new Date()

  const timeslots: string[] = []
  for (let i = 0; i < days; i++) {
    const day = new Date(start.getTime() + (i * 24 * 60 * 60 * 1000))
    const dow = day.getUTCDay()

    // Schedules for this doctor and day
    const schedules = await query<any>(
      `SELECT slot_len_minutes,
              TIME_FORMAT(start_time, '%H:%i') as start_time,
              TIME_FORMAT(end_time, '%H:%i') as end_time
       FROM doctor_schedules
       WHERE doctor_id = ? AND day_of_week = ? AND is_active = 1`,
      [doctorId, dow],
    )

    // Existing booked appointments for this day
    const appts = await query<any>(
      `SELECT start_time FROM appointments
       WHERE doctor_id = ? AND DATE(start_time) = DATE(?) AND status = 'BOOKED'`,
      [doctorId, format(day)],
    )
    const taken = new Set(appts.map((a) => new Date(a.start_time).toISOString()))

    for (const s of schedules) {
      const [sh, sm] = s.start_time.split(":").map(Number)
      const [eh, em] = s.end_time.split(":").map(Number)
      const slotLen = Number(s.slot_len_minutes) || 30

      const begin = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), sh, sm, 0, 0))
      const end = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), eh, em, 0, 0))
      for (let t = begin.getTime(); t < end.getTime(); t += slotLen * 60 * 1000) {
        const slot = new Date(t)
        if (slot < now) continue // future only
        const iso = slot.toISOString()
        if (!taken.has(iso)) timeslots.push(iso)
      }
    }
  }

  return Response.json({ timeslots: timeslots.map((t) => ({ timeISO: t })) })
}

function format(d: Date) {
  return d.toISOString().slice(0, 19).replace("T", " ")
}
