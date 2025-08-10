import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { QueueEntry } from "../entities/queue-entry.entity"

@Injectable()
export class QueueService {
  constructor(
    @InjectRepository(QueueEntry)
    private queueRepository: Repository<QueueEntry>,
  ) {}

  async findAll(): Promise<QueueEntry[]> {
    return this.queueRepository.find({
      relations: ["patient", "doctor"],
      where: { status: "waiting" },
      order: { queueNumber: "ASC" },
    })
  }

  async findOne(id: number): Promise<QueueEntry> {
    return this.queueRepository.findOne({
      where: { id },
      relations: ["patient", "doctor"],
    })
  }

  async create(queueData: Partial<QueueEntry>): Promise<QueueEntry> {
    // Get next queue number
    const result = await this.queueRepository
      .createQueryBuilder("queue")
      .select("MAX(queue.queueNumber)", "maxQueueNumber")
      .getRawOne()
    
    const queueNumber = result?.maxQueueNumber ? result.maxQueueNumber + 1 : 1

    const queueEntry = this.queueRepository.create({
      ...queueData,
      queueNumber,
      checkInTime: new Date(),
    })

    return this.queueRepository.save(queueEntry)
  }

  async update(id: number, queueData: Partial<QueueEntry>): Promise<QueueEntry> {
    await this.queueRepository.update(id, queueData)
    return this.findOne(id)
  }

  async remove(id: number): Promise<void> {
    await this.queueRepository.delete(id)
  }

  async callNext(doctorId?: number): Promise<QueueEntry> {
    const query = this.queueRepository
      .createQueryBuilder("queue")
      .where("queue.status = :status", { status: "waiting" })
      .orderBy("queue.priorityLevel", "DESC")
      .addOrderBy("queue.queueNumber", "ASC")

    if (doctorId) {
      query.andWhere("queue.doctorId = :doctorId", { doctorId })
    }

    const nextEntry = await query.getOne()

    if (nextEntry) {
      nextEntry.status = "in_progress"
      nextEntry.calledTime = new Date()
      return this.queueRepository.save(nextEntry)
    }

    return null
  }
}
