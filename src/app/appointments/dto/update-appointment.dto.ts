import { PartialType } from '@nestjs/swagger';
import { CreateAppointmentDto } from './create-appointment.dto';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
} from 'class-validator';
import { BookingStatus } from '../entities/appointment.entity';
import { Gender } from '@/app/users/entities/user.entity';

export class UpdateAppointmentDto {
  @IsOptional()
  username: string;

  @IsOptional()
  notes: string;

  @IsEnum(BookingStatus)
  @IsOptional()
  status: BookingStatus;

  @IsPhoneNumber()
  @IsOptional()
  phone: string;

  @IsEnum(Gender)
  @IsOptional()
  gender: Gender;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsOptional()
  memberId: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsOptional()
  serviceIds: number[];

  @IsPositive()
  @IsOptional()
  startTime: number;
}
