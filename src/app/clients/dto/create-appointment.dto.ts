import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
} from 'class-validator';
import { BookingStatus } from '@/app/appointments/entities/appointment.entity';
import { Gender } from '@/app/users/entities/user.entity';

export class AddAppointmentDto {
  @IsNotEmpty()
  @IsDate()
  date: string;

  @IsNotEmpty()
  clientId: number;

  @IsNotEmpty()
  username: string;

  @IsOptional()
  notes: string;

  @IsEnum(BookingStatus)
  status: BookingStatus;

  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsNotEmpty()
  memberId: number;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  serviceIds: number[];

  @IsNotEmpty()
  @IsPositive()
  start: number;
}
