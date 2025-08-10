import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { User } from "./user.entity"
import { Doctor } from "./doctor.entity"
import { Patient } from "./patient.entity"
import { Department } from "./department.entity"

@Entity("clinics")
export class Clinic {
  @PrimaryGeneratedColumn("increment", { type: "bigint", unsigned: true })
  id: number

  @Column({ type: "varchar", length: 255 })
  name: string

  @Column({ type: "text", nullable: true })
  address: string

  @Column({ type: "varchar", length: 32, nullable: true })
  phone: string

  @Column({ type: "varchar", length: 255, nullable: true })
  email: string

  @Column({ type: "varchar", length: 64, default: "UTC" })
  timezone: string

  @Column({ type: "json", nullable: true })
  settings: any

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date

  @OneToMany(
    () => User,
    (user) => user.clinic,
  )
  users: User[]

  @OneToMany(
    () => Doctor,
    (doctor) => doctor.clinic,
  )
  doctors: Doctor[]

  @OneToMany(
    () => Patient,
    (patient) => patient.clinic,
  )
  patients: Patient[]

  @OneToMany(
    () => Department,
    (department) => department.clinic,
  )
  departments: Department[]
}
