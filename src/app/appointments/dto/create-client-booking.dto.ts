import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
} from 'class-validator';
import { BookingStatus } from '@/app/appointments/entities/appointment.entity';
import { Gender } from '@/app/users/entities/user.entity';

export class ClientAppointmentDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  username: string;

  @IsOptional()
  notes: string;

  @IsEnum(BookingStatus)
  status: BookingStatus;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @IsOptional()
  @IsUrl()
  profilePicture: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  memberId: number;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  serviceIds: number[];

  @IsNotEmpty()
  @IsPositive()
  startTime: number;
}
