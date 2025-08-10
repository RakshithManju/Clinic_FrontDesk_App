import type { Appointment, Doctor, QueueEntry, Availability, Patient, RefreshTokenRecord } from "./types"

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

const seedDoctors: Doctor[] = [
  {
    id: "d1",
    name: "Dr. Alice Park",
    specialization: "General Medicine",
    gender: "female",
    location: "Main Clinic",
    availability: [
      { day: 1, start: "09:00", end: "17:00" },
      { day: 2, start: "09:00", end: "17:00" },
      { day: 3, start: "09:00", end: "17:00" },
      { day: 4, start: "09:00", end: "17:00" },
      { day: 5, start: "09:00", end: "15:00" },
    ],
    active: true,
  },
  {
    id: "d2",
    name: "Dr. Ben Carter",
    specialization: "Pediatrics",
    gender: "male",
    location: "Annex A",
    availability: [
      { day: 1, start: "10:00", end: "18:00" },
      { day: 3, start: "10:00", end: "18:00" },
      { day: 5, start: "10:00", end: "16:00" },
    ],
    active: true,
  },
  {
    id: "d3",
    name: "Dr. Chen Li",
    specialization: "Dermatology",
    gender: "female",
    location: "Telehealth",
    availability: [
      { day: 2, start: "08:00", end: "12:00" },
      { day: 4, start: "13:00", end: "17:00" },
    ],
    active: true,
  },
]

class InMemoryStore {
  doctors: Doctor[] = [...seedDoctors]
  queue: QueueEntry[] = []
  appointments: Appointment[] = []
  patients: Patient[] = [
    {
      id: "p1",
      firstName: "Jane",
      lastName: "Doe",
      phone: "+15550001",
      email: "jane@example.com",
      createdAt: new Date().toISOString(),
    },
  ]
  nextQueueNumber = 1

  // Refresh token store (rotation and revocation)
  refreshTokens: RefreshTokenRecord[] = []

  // Sessions
  saveRefreshToken(rec: RefreshTokenRecord) {
    this.refreshTokens.push(rec)
  }
  getRefreshRecord(hash: string) {
    return this.refreshTokens.find((r) => r.tokenHash === hash)
  }
  revokeRefresh(hash: string) {
    const rec = this.getRefreshRecord(hash)
    if (rec) rec.revoked = true
  }

  // Doctor ops
  listDoctors(params?: { search?: string; specialization?: string; location?: string }) {
    let items = [...this.doctors]
    if (params?.search) {
      const q = params.search.toLowerCase()
      items = items.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q),
      )
    }
    if (params?.specialization) {
      items = items.filter((d) => d.specialization === params.specialization)
    }
    if (params?.location) {
      items = items.filter((d) => d.location === params.location)
    }
    return items
  }
  addDoctor(doc: Omit<Doctor, "id">) {
    const id = uid()
    const d: Doctor = { ...doc, id }
    this.doctors.push(d)
    return d
  }
  updateDoctor(id: string, patch: Partial<Doctor>) {
    const idx = this.doctors.findIndex((d) => d.id === id)
    if (idx === -1) return null
    this.doctors[idx] = { ...this.doctors[idx], ...patch, id }
    return this.doctors[idx]
  }
  deleteDoctor(id: string) {
    this.doctors = this.doctors.filter((d) => d.id !== id)
  }

  // Patients
  listPatients() {
    return [...this.patients]
  }
  addPatient(input: { firstName: string; lastName: string; phone?: string; email?: string }) {
    const p: Patient = {
      id: uid(),
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      email: input.email,
      createdAt: new Date().toISOString(),
    }
    this.patients.push(p)
    return p
  }
  updatePatient(id: string, patch: Partial<Patient>) {
    const idx = this.patients.findIndex((p) => p.id === id)
    if (idx === -1) return null
    this.patients[idx] = { ...this.patients[idx], ...patch, id }
    return this.patients[idx]
  }
  deletePatient(id: string) {
    this.patients = this.patients.filter((p) => p.id !== id)
  }

  // Queue ops
  listQueue() {
    return [...this.queue]
  }
  addToQueue(input: { patientName: string; priority?: "normal" | "urgent"; doctorId?: string | null }) {
    const entry: QueueEntry = {
      id: uid(),
      queueNumber: this.nextQueueNumber++,
      patientName: input.patientName,
      status: "waiting",
      priority: input.priority || "normal",
      doctorId: input.doctorId || null,
      createdAt: new Date().toISOString(),
    }
    this.queue.push(entry)
    return entry
  }
  updateQueue(id: string, patch: Partial<QueueEntry>) {
    const idx = this.queue.findIndex((q) => q.id === id)
    if (idx === -1) return null
    this.queue[idx] = { ...this.queue[idx], ...patch, id }
    return this.queue[idx]
  }
  deleteQueue(id: string) {
    this.queue = this.queue.filter((q) => q.id !== id)
  }

  // Appointment ops
  listAppointments(filter?: { doctorId?: string }) {
    let items = [...this.appointments]
    if (filter?.doctorId) items = items.filter((a) => a.doctorId === filter.doctorId)
    return items
  }
  isWithinAvailability(av: Availability[], when: Date) {
    const day = when.getDay()
    const slots = av.filter((a) => a.day === day)
    return slots.some((s) => {
      const [sh, sm] = s.start.split(":").map(Number)
      const [eh, em] = s.end.split(":").map(Number)
      const start = new Date(when)
      start.setHours(sh, sm, 0, 0)
      const end = new Date(when)
      end.setHours(eh, em, 0, 0)
      return when >= start && when < end
    })
  }
  isSlotTaken(doctorId: string, whenISO: string) {
    const when = new Date(whenISO).getTime()
    return this.appointments.some(
      (a) => a.doctorId === doctorId && a.status === "booked" && new Date(a.timeISO).getTime() === when,
    )
  }
  addAppointment(input: { patientName: string; doctorId: string; timeISO: string }) {
    const doctor = this.doctors.find((d) => d.id === input.doctorId)
    if (!doctor) throw new Error("Doctor not found")
    const when = new Date(input.timeISO)
    if (!this.isWithinAvailability(doctor.availability, when)) throw new Error("Outside doctor's availability")
    if (this.isSlotTaken(doctor.id, input.timeISO)) throw new Error("Timeslot already booked")

    const a: Appointment = {
      id: uid(),
      patientName: input.patientName,
      doctorId: input.doctorId,
      timeISO: new Date(input.timeISO).toISOString(),
      status: "booked",
      createdAt: new Date().toISOString(),
    }
    this.appointments.push(a)
    return a
  }
  updateAppointment(id: string, patch: Partial<Appointment>) {
    const idx = this.appointments.findIndex((a) => a.id === id)
    if (idx === -1) return null
    if (patch.timeISO) {
      const ap = this.appointments[idx]
      const doc = this.doctors.find((d) => d.id === (patch.doctorId || ap.doctorId))
      if (!doc) throw new Error("Doctor not found")
      const when = new Date(patch.timeISO)
      if (!this.isWithinAvailability(doc.availability, when)) throw new Error("Outside doctor's availability")
      if (this.isSlotTaken(doc.id, when.toISOString())) throw new Error("Timeslot already booked")
    }
    this.appointments[idx] = { ...this.appointments[idx], ...patch, id }
    return this.appointments[idx]
  }
  cancelAppointment(id: string) {
    return this.updateAppointment(id, { status: "canceled" })
  }

  // Timeslots: 30m granularity for N days
  generateTimeslots(doctorId: string, startDateISO: string, days: number) {
    const doc = this.doctors.find((d) => d.id === doctorId)
    if (!doc) return []
    const startDate = new Date(startDateISO)
    startDate.setHours(0, 0, 0, 0)
    const now = new Date()
    const times: string[] = []
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      const dow = date.getDay()
      const daySlots = doc.availability.filter((a) => a.day === dow)
      for (const s of daySlots) {
        const [sh, sm] = s.start.split(":").map(Number)
        const [eh, em] = s.end.split(":").map(Number)
        const begin = new Date(date)
        begin.setHours(sh, sm, 0, 0)
        const end = new Date(date)
        end.setHours(eh, em, 0, 0)
        for (let t = begin.getTime(); t < end.getTime(); t += 30 * 60 * 1000) {
          const slot = new Date(t)
          if (slot < now) continue // future only
          const iso = slot.toISOString()
          if (!this.isSlotTaken(doctorId, iso)) times.push(iso)
        }
      }
    }
    return times
  }
}

// Singleton
const globalAny = globalThis as unknown as { __clinicStore?: InMemoryStore }
export const store = globalAny.__clinicStore || (globalAny.__clinicStore = new InMemoryStore())
