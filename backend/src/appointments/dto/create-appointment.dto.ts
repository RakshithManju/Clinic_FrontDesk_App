import { IsString, IsDateString, IsOptional, IsNumber, IsEnum } from 'class-validator';

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export class CreateAppointmentDto {
  @IsNumber()
  patientId: number;

  @IsNumber()
  doctorId: number;

  @IsDateString()
  appointmentDate: string;

  @IsString()
  appointmentTime: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  appointmentType?: string;

  @IsOptional()
  @IsString()
  duration?: string;
}
