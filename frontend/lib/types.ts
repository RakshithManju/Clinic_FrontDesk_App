export interface User {
  id: number
  email: string
  firstName?: string
  lastName?: string
  roles: string[]
  clinicId: number
}

export interface Doctor {
  id: number
  clinicId: string
  departmentId: string
  employeeId: string
  name: string
  specialization: string
  subSpecialization?: string
  gender: "male" | "female" | "other"
  dateOfBirth?: string
  phone?: string
  email?: string
  licenseNumber?: string
  experienceYears?: number
  education?: string
  location: string
  consultationFee?: string
  profile?: string
  avatarUrl?: string
  isActive: number
  createdAt: string
  updatedAt: string
  schedules?: DoctorSchedule[]
}

export interface DoctorSchedule {
  id: number
  doctorId: number
  dayOfWeek: string
  startTime: string
  endTime: string
  isAvailable: number
  maxPatients: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Patient {
  id: number
  clinicId: string
  patientId?: string
  firstName: string
  lastName: string
  dateOfBirth?: string
  gender?: "male" | "female" | "other"
  phone?: string
  email?: string
  address?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  bloodGroup?: string
  allergies?: string
  medicalHistory?: string
  insuranceInfo?: string
  metadata?: string
  avatarUrl?: string
  isActive: number
  createdAt: string
  updatedAt: string
}

export interface Appointment {
  id: number
  patient: Patient
  doctor: Doctor
  startTime: string
  endTime: string
  status: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW"
  type: "CONSULTATION" | "FOLLOW_UP" | "EMERGENCY"
  notes?: string
  feeCharged?: number
}

export interface QueueEntry {
  id: number
  patient: Patient
  queueNumber: number
  status: "WAITING" | "CALLED" | "WITH_DOCTOR" | "COMPLETED" | "CANCELLED"
  priority: "NORMAL" | "URGENT" | "EMERGENCY"
  assignedDoctor?: Doctor
  arrivalTime: string
  notes?: string
}

export interface Department {
  id: number
  name: string
  description?: string
  location?: string
  isActive: boolean
}
