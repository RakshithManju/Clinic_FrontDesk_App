import { Controller, Get, UseGuards } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger"
import { UsersService } from "./users.service"

@ApiTags("users")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll()
  }
}
