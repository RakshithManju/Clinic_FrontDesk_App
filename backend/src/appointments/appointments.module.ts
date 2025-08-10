import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AppointmentsService } from "./appointments.service"
import { AppointmentsController } from "./appointments.controller"
import { Appointment } from "../entities/appointment.entity"
import { Doctor } from "../entities/doctor.entity"
import { Patient } from "../entities/patient.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Doctor, Patient])],
  providers: [AppointmentsService],
  controllers: [AppointmentsController],
})
export class AppointmentsModule {}
