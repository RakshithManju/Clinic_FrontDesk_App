import { Controller, Get, Post, Patch, Param, Delete, Query, UseGuards, Body, UsePipes, ValidationPipe } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import { PatientsService } from "./patients.service"
import { Patient } from "../entities/patient.entity"
import { CreatePatientDto } from "./dto/create-patient.dto"
import { UpdatePatientDto } from "./dto/update-patient.dto"

@ApiTags("Patients")
@Controller("patients")
@UseGuards(AuthGuard("jwt"))
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new patient" })
  @ApiResponse({ status: 201, description: "Patient created successfully" })
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientsService.create(createPatientDto)
  }

  @Get()
  @ApiOperation({ summary: 'Get all patients' })
  @ApiResponse({ status: 200, description: 'Patients retrieved successfully' })
  findAll(@Query('search') search?: string) {
    if (search) {
      return this.patientsService.search(search);
    }
    return this.patientsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get patient by ID' })
  @ApiResponse({ status: 200, description: 'Patient retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update patient" })
  @ApiResponse({ status: 200, description: "Patient updated successfully" })
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientsService.update(+id, updatePatientDto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete patient' })
  @ApiResponse({ status: 200, description: 'Patient deleted successfully' })
  remove(@Param('id') id: string) {
    return this.patientsService.remove(+id);
  }
}
