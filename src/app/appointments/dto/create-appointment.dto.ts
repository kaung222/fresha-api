import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
  ValidateIf,
} from 'class-validator';
import { BookingStatus } from '../entities/appointment.entity';
import { Gender } from '@/app/users/entities/user.entity';

class BookingItem {
  @IsNotEmpty()
  serviceId: number;
}
export class CreateAppointmentDto {
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
  @IsPhoneNumber()
  phone: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsNotEmpty()
  memberId: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsNotEmpty({ each: true }) // Ensures no element in the array is empty
  @IsInt({ each: true }) // Ensures every element is an integer
  serviceIds: number[];

  @IsOptional()
  @ValidateIf((obj) => !obj.serviceIds || obj.serviceIds.length === 0)
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsInt({ each: true })
  packageIds: number[];

  @IsNotEmpty()
  orgId: number;

  @IsNotEmpty()
  @IsPositive()
  startTime: number;
}
