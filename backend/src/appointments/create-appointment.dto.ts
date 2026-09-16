import { IsEmail, IsEnum, IsISO8601, IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';
import { AppointmentType } from '../generated/prisma/enums.js';

export class CreateAppointmentDto {
  @IsString()
  @Length(2, 100)
  patientName!: string;

  @IsString()
  @Matches(/^\+?[0-9 ()-]{8,20}$/)
  phone!: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(150)
  email?: string;

  @IsISO8601()
  startAt!: string;

  @IsEnum(AppointmentType)
  type!: AppointmentType;
}
