import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm"
import { Clinic } from "./clinic.entity"
import { Doctor } from "./doctor.entity"

@Entity("departments")
export class Department {
  @PrimaryGeneratedColumn("increment", { type: "bigint", unsigned: true })
  id: number

  @Column({ name: "clinic_id", type: "bigint", unsigned: true })
  clinicId: number

  @Column({ type: "varchar", length: 255 })
  name: string

  @Column({ type: "text", nullable: true })
  description: string

  @Column({ type: "varchar", length: 255, nullable: true })
  location: string

  @Column({ name: "is_active", type: "tinyint", width: 1, default: 1 })
  isActive: boolean

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @ManyToOne(
    () => Clinic,
    (clinic) => clinic.departments,
  )
  @JoinColumn({ name: "clinic_id" })
  clinic: Clinic

  @OneToMany(
    () => Doctor,
    (doctor) => doctor.department,
  )
  doctors: Doctor[]
}
