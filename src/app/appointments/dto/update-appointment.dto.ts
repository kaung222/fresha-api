import { PartialType } from '@nestjs/swagger';
import { CreateAppointmentDto } from './create-appointment.dto';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
  IsString,
  ValidateIf,
} from 'class-validator';
import { BookingStatus } from '../entities/appointment.entity';
import { Gender } from '@/app/users/entities/user.entity';

export class UpdateAppointmentDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  notes: string;

  @IsEnum(BookingStatus)
  @IsNotEmpty()
  status: BookingStatus;

  @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  memberId: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty()
  serviceIds: number[];

  @IsOptional()
  @ValidateIf((obj) => !obj.serviceIds || obj.serviceIds.length === 0)
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsInt({ each: true })
  packageIds: number[];

  @IsPositive()
  @IsNotEmpty()
  startTime: number;
}
