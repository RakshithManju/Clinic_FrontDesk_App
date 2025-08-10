import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Patient } from "../entities/patient.entity"

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  async findAll(): Promise<Patient[]> {
    return this.patientRepository.find({
      where: { isActive: true },
      order: { createdAt: "DESC" },
    })
  }

  async findOne(id: number): Promise<Patient> {
    return this.patientRepository.findOne({
      where: { id },
      relations: ["appointments", "queueEntries"],
    })
  }

  async create(patientData: Partial<Patient>): Promise<Patient> {
    const patient = this.patientRepository.create(patientData)
    return this.patientRepository.save(patient)
  }

  async update(id: number, patientData: Partial<Patient>): Promise<Patient> {
    await this.patientRepository.update(id, patientData)
    return this.findOne(id)
  }

  async remove(id: number): Promise<void> {
    await this.patientRepository.update(id, { isActive: false })
  }

  async search(query: string): Promise<Patient[]> {
    return this.patientRepository
      .createQueryBuilder("patient")
      .where("patient.firstName LIKE :query", { query: `%${query}%` })
      .orWhere("patient.lastName LIKE :query", { query: `%${query}%` })
      .orWhere("patient.email LIKE :query", { query: `%${query}%` })
      .orWhere("patient.phone LIKE :query", { query: `%${query}%` })
      .andWhere("patient.isActive = :isActive", { isActive: true })
      .getMany()
  }
}
