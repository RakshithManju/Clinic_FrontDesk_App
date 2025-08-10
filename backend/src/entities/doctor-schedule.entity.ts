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

@Entity("doctor_schedules")
export class DoctorSchedule {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: "doctor_id", type: "bigint", unsigned: true })
  doctorId: number

  @Column({
    name: "day_of_week",
    type: "enum",
    enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
  })
  dayOfWeek: string

  @Column({ name: "start_time", type: "time" })
  startTime: string

  @Column({ name: "end_time", type: "time" })
  endTime: string

  @Column({ name: "is_available", type: "tinyint", width: 1, default: 1 })
  isAvailable: boolean

  @Column({ name: "max_patients", type: "int", unsigned: true, default: 20 })
  maxPatients: number

  @Column({ type: "text", nullable: true })
  notes: string

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date

  @ManyToOne(
    () => Doctor,
    (doctor) => doctor.schedules,
  )
  @JoinColumn({ name: "doctor_id" })
  doctor: Doctor
}
