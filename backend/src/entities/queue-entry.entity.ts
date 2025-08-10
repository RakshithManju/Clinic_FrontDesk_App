import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { Patient } from "./patient.entity"
import { Doctor } from "./doctor.entity"

@Entity("queue_entries")
export class QueueEntry {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: "clinic_id", type: "bigint", unsigned: true, default: 1 })
  clinicId: number

  @Column({ name: "patient_id", type: "bigint", unsigned: true })
  patientId: number

  @Column({ name: "doctor_id", type: "bigint", unsigned: true, nullable: true })
  doctorId: number

  @Column({ name: "queue_number", type: "int", unsigned: true })
  queueNumber: number

  @Column({ name: "priority_level", type: "enum", enum: ["low", "normal", "high", "urgent"], default: "normal" })
  priorityLevel: string

  @Column({ type: "enum", enum: ["waiting", "in_progress", "completed", "cancelled"], default: "waiting" })
  status: string

  @Column({ name: "estimated_wait_time", type: "int", unsigned: true, nullable: true })
  estimatedWaitTime: number

  @Column({ name: "check_in_time", type: "datetime" })
  checkInTime: Date

  @Column({ name: "called_time", type: "datetime", nullable: true })
  calledTime: Date

  @Column({ name: "service_start_time", type: "datetime", nullable: true })
  serviceStartTime: Date

  @Column({ name: "service_end_time", type: "datetime", nullable: true })
  serviceEndTime: Date

  @Column({ type: "text", nullable: true })
  notes: string

  @Column({ name: "appointment_id", type: "bigint", unsigned: true, nullable: true })
  appointmentId: number

  @Column({ type: "json", nullable: true })
  metadata: any

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date

  @ManyToOne(
    () => Patient,
    (patient) => patient.queueEntries,
  )
  @JoinColumn({ name: "patient_id" })
  patient: Patient

  @ManyToOne(
    () => Doctor,
    (doctor) => doctor.appointments,
  )
  @JoinColumn({ name: "doctor_id" })
  doctor: Doctor
}
