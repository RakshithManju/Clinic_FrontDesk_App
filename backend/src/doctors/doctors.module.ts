import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { DoctorsService } from "./doctors.service"
import { DoctorsController } from "./doctors.controller"
import { Doctor } from "../entities/doctor.entity"
import { DoctorSchedule } from "../entities/doctor-schedule.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Doctor, DoctorSchedule])],
  providers: [DoctorsService],
  controllers: [DoctorsController],
})
export class DoctorsModule {}
