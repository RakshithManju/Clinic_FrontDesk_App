import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from "typeorm"
import { Appointment } from "./appointment.entity"
import { QueueEntry } from "./queue-entry.entity"
import { Clinic } from "./clinic.entity"

@Entity("patients")
export class Patient {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: "clinic_id", type: "bigint", unsigned: true, default: 1 })
  clinicId: number

  @Column({ name: "patient_id", type: "varchar", length: 50, unique: true, nullable: true })
  patientId: string

  @Column({ name: "first_name", type: "varchar", length: 100 })
  firstName: string

  @Column({ name: "last_name", type: "varchar", length: 100 })
  lastName: string

  @Column({ name: "date_of_birth", type: "date", nullable: true })
  dateOfBirth: Date

  @Column({ type: "enum", enum: ["male", "female", "other"], nullable: true })
  gender: "male" | "female" | "other"

  @Column({ type: "varchar", length: 32, nullable: true })
  phone: string

  @Column({ type: "varchar", length: 255, nullable: true })
  email: string

  @Column({ type: "text", nullable: true })
  address: string

  @Column({ name: "emergency_contact_name", type: "varchar", length: 255, nullable: true })
  emergencyContactName: string

  @Column({ name: "emergency_contact_phone", type: "varchar", length: 32, nullable: true })
  emergencyContactPhone: string

  @Column({ name: "blood_group", type: "varchar", length: 10, nullable: true })
  bloodGroup: string

  @Column({ type: "text", nullable: true })
  allergies: string

  @Column({ name: "medical_history", type: "text", nullable: true })
  medicalHistory: string

  @Column({ name: "insurance_info", type: "json", nullable: true })
  insuranceInfo: any

  @Column({ type: "json", nullable: true })
  metadata: any

  @Column({ name: "avatar_url", type: "varchar", length: 500, nullable: true })
  avatarUrl: string

  @Column({ name: "is_active", type: "tinyint", width: 1, default: 1 })
  isActive: boolean

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date

  @OneToMany(
    () => Appointment,
    (appointment) => appointment.patient,
  )
  appointments: Appointment[]

  @OneToMany(
    () => QueueEntry,
    (queueEntry) => queueEntry.patient,
  )
  queueEntries: QueueEntry[]

  @ManyToOne(
    () => Clinic,
    (clinic) => clinic.patients,
  )
  @JoinColumn({ name: "clinic_id" })
  clinic: Clinic
}
