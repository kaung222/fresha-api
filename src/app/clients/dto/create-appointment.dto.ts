import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';
import { BookingStatus } from '@/app/appointments/entities/appointment.entity';
import { Gender } from '@/app/users/entities/user.entity';

export class AddAppointmentDto {
  @IsNotEmpty()
  clientId: number;

  @IsNotEmpty()
  date: Date;

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
}
