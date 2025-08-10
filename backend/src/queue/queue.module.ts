import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { QueueService } from "./queue.service"
import { QueueController } from "./queue.controller"
import { QueueEntry } from "../entities/queue-entry.entity"
import { Patient } from "../entities/patient.entity"
import { Doctor } from "../entities/doctor.entity"

@Module({
  imports: [TypeOrmModule.forFeature([QueueEntry, Patient, Doctor])],
  providers: [QueueService],
  controllers: [QueueController],
})
export class QueueModule {}
