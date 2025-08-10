import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { User } from "../entities/user.entity"

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { email } })
  }

  async findById(id: number): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { id } })
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ["id", "email", "firstName", "lastName", "roles", "isActive", "createdAt"],
    })
  }
}
