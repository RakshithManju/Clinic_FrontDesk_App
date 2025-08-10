import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from "typeorm"
import { DoctorSchedule } from "./doctor-schedule.entity"
import { Appointment } from "./appointment.entity"
import { Clinic } from "./clinic.entity"
import { Department } from "./department.entity"

@Entity("doctors")
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: "clinic_id", type: "bigint", unsigned: true, default: 1 })
  clinicId: number

  @Column({ name: "department_id", type: "bigint", unsigned: true, nullable: true })
  departmentId: number

  @Column({ name: "employee_id", type: "varchar", length: 50, nullable: true })
  employeeId: string

  @Column({ type: "varchar", length: 255 })
  name: string

  @Column({ type: "varchar", length: 100 })
  specialization: string

  @Column({ name: "sub_specialization", type: "varchar", length: 100, nullable: true })
  subSpecialization: string

  @Column({ type: "enum", enum: ["male", "female", "other"] })
  gender: "male" | "female" | "other"

  @Column({ name: "date_of_birth", type: "date", nullable: true })
  dateOfBirth: Date

  @Column({ type: "varchar", length: 32, nullable: true })
  phone: string

  @Column({ type: "varchar", length: 255, nullable: true })
  email: string

  @Column({ name: "license_number", type: "varchar", length: 100, nullable: true })
  licenseNumber: string

  @Column({ name: "experience_years", type: "int", unsigned: true, nullable: true })
  experienceYears: number

  @Column({ type: "text", nullable: true })
  education: string

  @Column({ type: "varchar", length: 100 })
  location: string

  @Column({ name: "consultation_fee", type: "decimal", precision: 10, scale: 2, nullable: true })
  consultationFee: number

  @Column({ type: "json", nullable: true })
  profile: any

  @Column({ name: "avatar_url", type: "varchar", length: 500, nullable: true })
  avatarUrl: string

  @Column({ name: "is_active", type: "tinyint", width: 1, default: 1 })
  isActive: boolean

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date

  @OneToMany(
    () => DoctorSchedule,
    (schedule) => schedule.doctor,
  )
  schedules: DoctorSchedule[]

  @OneToMany(
    () => Appointment,
    (appointment) => appointment.doctor,
  )
  appointments: Appointment[]

  @ManyToOne(
    () => Clinic,
    (clinic) => clinic.doctors,
  )
  @JoinColumn({ name: "clinic_id" })
  clinic: Clinic

  @ManyToOne(
    () => Department,
    (department) => department.doctors,
  )
  @JoinColumn({ name: "department_id" })
  department: Department
}
