import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { Clinic } from "./clinic.entity"

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: "clinic_id", type: "bigint", unsigned: true, default: 1 })
  clinicId: number

  @Column({ type: "varchar", length: 255, unique: true })
  email: string

  @Column({ type: "varchar", length: 100, nullable: true })
  username: string

  @Column({ name: "password_hash", type: "varchar", length: 255 })
  passwordHash: string

  @Column({ name: "first_name", type: "varchar", length: 100, nullable: true })
  firstName: string

  @Column({ name: "last_name", type: "varchar", length: 100, nullable: true })
  lastName: string

  @Column({ type: "json", nullable: true })
  roles: string[]

  @Column({ name: "is_active", type: "tinyint", width: 1, default: 1 })
  isActive: boolean

  @Column({ name: "last_login_at", type: "datetime", nullable: true })
  lastLoginAt: Date

  @Column({ name: "password", type: "varchar", length: 255 })
  password: string

  @Column({ name: "role", type: "varchar", length: 100, default: "frontdesk" })
  role: string

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date

  @ManyToOne(
    () => Clinic,
    (clinic) => clinic.users,
  )
  @JoinColumn({ name: "clinic_id" })
  clinic: Clinic
}
