import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { BookingStatus } from '../entities/appointment.entity';
import { Type } from 'class-transformer';
import { Gender } from '@/app/users/entities/user.entity';

class BookingItem {
  @IsNotEmpty()
  serviceId: number;
}
export class CreateAppointmentDto {
  @IsNotEmpty()
  date: number;

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
  email: string;

  // @ValidateNested({ each: true })
  // @Type(() => BookingItem)
  // bookingItems: BookingItem[];

  @IsNotEmpty()
  memberId: number;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  serviceIds: number[];

  @IsNotEmpty()
  orgId: number;

  @IsNotEmpty()
  @IsPositive()
  start: number;
}
