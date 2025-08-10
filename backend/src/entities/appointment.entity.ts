import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { Doctor } from "./doctor.entity"
import { Patient } from "./patient.entity"

@Entity("appointments")
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: "clinic_id", type: "bigint", unsigned: true, default: 1 })
  clinicId: number

  @Column({ name: "patient_id", type: "bigint", unsigned: true })
  patientId: number

  @Column({ name: "doctor_id", type: "bigint", unsigned: true })
  doctorId: number

  @Column({ name: "appointment_date", type: "date" })
  appointmentDate: string

  @Column({ name: "appointment_time", type: "time" })
  appointmentTime: string

  @Column({ name: "duration_minutes", type: "int", unsigned: true, default: 30 })
  durationMinutes: number

  @Column({
    type: "enum",
    enum: ["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"],
    default: "scheduled",
  })
  status: string

  @Column({ name: "appointment_type", type: "varchar", length: 100, default: "consultation" })
  appointmentType: string

  @Column({ type: "text", nullable: true })
  notes: string

  @Column({ name: "chief_complaint", type: "text", nullable: true })
  chiefComplaint: string

  @Column({ name: "consultation_fee", type: "decimal", precision: 10, scale: 2, nullable: true })
  consultationFee: number

  @Column({
    name: "payment_status",
    type: "enum",
    enum: ["pending", "paid", "partially_paid", "refunded"],
    default: "pending",
  })
  paymentStatus: string

  @Column({ name: "reminder_sent", type: "tinyint", width: 1, default: 0 })
  reminderSent: boolean

  @Column({ type: "json", nullable: true })
  metadata: any

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date

  @ManyToOne(
    () => Doctor,
    (doctor) => doctor.appointments,
  )
  @JoinColumn({ name: "doctor_id" })
  doctor: Doctor

  @ManyToOne(
    () => Patient,
    (patient) => patient.appointments,
  )
  @JoinColumn({ name: "patient_id" })
  patient: Patient
}
