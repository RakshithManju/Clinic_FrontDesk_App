import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { Appointment } from "../entities/appointment.entity"

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  async findAll(): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      relations: ["doctor", "patient"],
      order: { appointmentDate: "ASC", appointmentTime: "ASC" },
    })
  }

  async findOne(id: number): Promise<Appointment> {
    return this.appointmentRepository.findOne({
      where: { id },
      relations: ["doctor", "patient"],
    })
  }

  async create(appointmentData: Partial<Appointment>): Promise<Appointment> {
    const appointment = this.appointmentRepository.create(appointmentData)
    return this.appointmentRepository.save(appointment)
  }

  async update(id: number, appointmentData: Partial<Appointment>): Promise<Appointment> {
    await this.appointmentRepository.update(id, appointmentData)
    return this.findOne(id)
  }

  async remove(id: number): Promise<void> {
    await this.appointmentRepository.delete(id)
  }

  async findByDate(date: string): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { appointmentDate: date },
      relations: ["doctor", "patient"],
      order: { appointmentTime: "ASC" },
    })
  }

  async findByDoctor(doctorId: number): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { doctorId },
      relations: ["doctor", "patient"],
      order: { appointmentDate: "ASC", appointmentTime: "ASC" },
    })
  }
}
