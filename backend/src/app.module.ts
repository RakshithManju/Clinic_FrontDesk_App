import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigModule } from "@nestjs/config"
import { AuthModule } from "./auth/auth.module"
import { DoctorsModule } from "./doctors/doctors.module"
import { PatientsModule } from "./patients/patients.module"
import { AppointmentsModule } from "./appointments/appointments.module"
import { QueueModule } from "./queue/queue.module"
import { User } from "./entities/user.entity"
import { Doctor } from "./entities/doctor.entity"
import { Patient } from "./entities/patient.entity"
import { Appointment } from "./entities/appointment.entity"
import { QueueEntry } from "./entities/queue-entry.entity"
import { DoctorSchedule } from "./entities/doctor-schedule.entity"
import { Clinic } from "./entities/clinic.entity"
import { Department } from "./entities/department.entity"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: "mysql",
      host: process.env.DB_HOST || "localhost",
      port: Number.parseInt(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_DATABASE || "new_clinic",
      entities: [User, Doctor, Patient, Appointment, QueueEntry, DoctorSchedule, Clinic, Department],
      synchronize: false, // Set to false in production
      logging: process.env.NODE_ENV === "development",
    }),
    AuthModule,
    DoctorsModule,
    PatientsModule,
    AppointmentsModule,
    QueueModule,
  ],
})
export class AppModule {}
