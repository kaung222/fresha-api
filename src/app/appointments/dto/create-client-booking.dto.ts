import {
  ArrayMinSize,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { BookingStatus } from '@/app/appointments/entities/appointment.entity';
import { Gender } from '@/app/users/entities/user.entity';
import { Type } from 'class-transformer';

export class BookingItemDto {
  @IsNotEmpty()
  @IsInt()
  serviceId: number;

  @IsNotEmpty()
  memberId: number;
}
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

  @ValidateNested()
  @ArrayMinSize(1)
  @Type(() => BookingItemDto)
  bookingItems: BookingItemDto[];

  @IsNotEmpty()
  @IsPositive()
  startTime: number;
}
