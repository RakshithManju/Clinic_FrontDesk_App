import { Controller, Get, Post, Patch, Param, Delete, UseGuards, Body, UsePipes, ValidationPipe } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import { DoctorsService } from "./doctors.service"
import { Doctor } from "../entities/doctor.entity"
import { CreateDoctorDto } from "./dto/create-doctor.dto"
import { UpdateDoctorDto } from "./dto/update-doctor.dto"

@ApiTags("Doctors")
@Controller("doctors")
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new doctor" })
  @ApiResponse({ status: 201, description: "Doctor created successfully" })
  create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorsService.create(createDoctorDto)
  }

  @Get()
  @ApiOperation({ summary: "Get all doctors" })
  @ApiResponse({ status: 200, description: "Doctors retrieved successfully" })
  findAll() {
    return this.doctorsService.findAll()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get doctor by ID' })
  @ApiResponse({ status: 200, description: 'Doctor retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update doctor" })
  @ApiResponse({ status: 200, description: "Doctor updated successfully" })
  update(@Param('id') id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
    return this.doctorsService.update(+id, updateDoctorDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete doctor' })
  @ApiResponse({ status: 200, description: 'Doctor deleted successfully' })
  remove(@Param('id') id: string) {
    return this.doctorsService.remove(+id);
  }

  @Get(':id/schedule')
  @ApiOperation({ summary: 'Get doctor schedule' })
  @ApiResponse({ status: 200, description: 'Schedule retrieved successfully' })
  getSchedule(@Param('id') id: string) {
    return this.doctorsService.getSchedule(+id);
  }
}
