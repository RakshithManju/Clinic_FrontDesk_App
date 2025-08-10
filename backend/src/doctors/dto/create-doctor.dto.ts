import { IsString, IsEmail, IsOptional, IsPhoneNumber, IsEnum } from 'class-validator';

export class CreateDoctorDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  specialization: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsString()
  education?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: 'male' | 'female' | 'other';

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  consultationFee?: number;

  @IsOptional()
  experienceYears?: number;

  @IsOptional()
  @IsString()
  subSpecialization?: string;
}
