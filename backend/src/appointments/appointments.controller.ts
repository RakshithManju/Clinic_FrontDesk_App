import { Controller, Get, Post, Patch, Param, Delete, Query, UseGuards, Body, UsePipes, ValidationPipe } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import { AppointmentsService } from "./appointments.service"
import { Appointment } from "../entities/appointment.entity"
import { CreateAppointmentDto } from "./dto/create-appointment.dto"
import { UpdateAppointmentDto } from "./dto/update-appointment.dto"

@ApiTags("Appointments")
@Controller("appointments")
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new appointment" })
  @ApiResponse({ status: 201, description: "Appointment created successfully" })
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentsService.create(createAppointmentDto)
  }

  @Get()
  @ApiOperation({ summary: "Get all appointments" })
  @ApiResponse({ status: 200, description: "Appointments retrieved successfully" })
  findAll(@Query('date') date?: string, @Query('doctorId') doctorId?: string) {
    if (date) {
      return this.appointmentsService.findByDate(date)
    }
    if (doctorId) {
      return this.appointmentsService.findByDoctor(+doctorId)
    }
    return this.appointmentsService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiResponse({ status: 200, description: 'Appointment retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update appointment" })
  @ApiResponse({ status: 200, description: "Appointment updated successfully" })
  update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentsService.update(+id, updateAppointmentDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete appointment' })
  @ApiResponse({ status: 200, description: 'Appointment deleted successfully' })
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(+id);
  }
}
