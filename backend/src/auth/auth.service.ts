import { Injectable } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import * as bcrypt from "bcryptjs"
import { User } from "../entities/user.entity"

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { email } })
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user
      return result
    }
    return null
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id, 
      roles: ['FRONT_DESK'] 
    }
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: 'refresh_token_placeholder', // TODO: implement refresh token
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: ['FRONT_DESK'],
        clinicId: user.clinicId || 1,
      },
    }
  }

  async findUserById(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } })
  }
}
