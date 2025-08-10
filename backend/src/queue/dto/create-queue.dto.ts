import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';

export enum QueueStatus {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CALLED = 'CALLED',
  SKIPPED = 'SKIPPED'
}

export class CreateQueueDto {
  @IsNumber()
  patientId: number;

  @IsNumber()
  doctorId: number;

  @IsOptional()
  @IsNumber()
  appointmentId?: number;

  @IsOptional()
  @IsEnum(QueueStatus)
  status?: QueueStatus;

  @IsOptional()
  @IsNumber()
  priority?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  estimatedWaitTime?: number;
}
