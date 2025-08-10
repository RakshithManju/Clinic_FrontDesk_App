export type UserPayload = {
  sub: string
  email: string
  role: "frontdesk" | "admin"
}

export type Availability = {
  day: number // 0-6 (Sun-Sat)
  start: string // "HH:mm"
  end: string // "HH:mm"
}

export type Doctor = {
  id: string
  name: string
  specialization: string
  gender: "male" | "female" | "other"
  location: string
  availability: Availability[]
  active: boolean
}

export type QueueEntry = {
  id: string
  queueNumber: number
  patientName: string
  status: "waiting" | "with-doctor" | "completed" | "no-show" | "canceled"
  priority: "normal" | "urgent"
  doctorId?: string | null
  createdAt: string // ISO
}

export type Appointment = {
  id: string
  patientName: string
  doctorId: string
  timeISO: string
  status: "booked" | "completed" | "canceled" | "rescheduled" | "no-show"
  createdAt: string
}

export type Patient = {
  id: string
  firstName: string
  lastName: string
  phone?: string
  email?: string
  createdAt: string
}

export type RefreshTokenRecord = {
  tokenHash: string
  userId: string
  deviceId?: string
  familyId: string
  issuedAt: number // ms
  expiresAt: number // ms
  revoked: boolean
  lastUsedAt?: number
}
