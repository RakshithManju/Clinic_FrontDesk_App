import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Doctor } from "../entities/doctor.entity"
import { DoctorSchedule } from "../entities/doctor-schedule.entity"

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    @InjectRepository(DoctorSchedule)
    private scheduleRepository: Repository<DoctorSchedule>,
  ) {}

  async findAll(): Promise<Doctor[]> {
    return this.doctorRepository.find({
      relations: ["schedules"],
      where: { isActive: true },
    })
  }

  async findOne(id: number): Promise<Doctor> {
    return this.doctorRepository.findOne({
      where: { id },
      relations: ["schedules", "appointments"],
    })
  }

  async create(doctorData: Partial<Doctor>): Promise<Doctor> {
    const doctor = this.doctorRepository.create(doctorData)
    return this.doctorRepository.save(doctor)
  }

  async update(id: number, doctorData: Partial<Doctor>): Promise<Doctor> {
    await this.doctorRepository.update(id, doctorData)
    return this.findOne(id)
  }

  async remove(id: number): Promise<void> {
    await this.doctorRepository.update(id, { isActive: false })
  }

  async getSchedule(doctorId: number): Promise<DoctorSchedule[]> {
    return this.scheduleRepository.find({
      where: { doctorId, isAvailable: true },
    })
  }
}
