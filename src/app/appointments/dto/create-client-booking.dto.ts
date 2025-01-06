import {
  ArrayMinSize,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsPositive,
  IsString,
  IsUrl,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { BookingStatus } from '@/app/appointments/entities/appointment.entity';
import { Gender } from '@/app/users/entities/user.entity';
import { Type } from 'class-transformer';

export class BookingItemDto {
  @IsNotEmpty()
  @IsUUID()
  serviceId: string;

  @IsOptional()
  @IsUUID()
  memberId: string;
}
export class ClientAppointmentDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  notes: string;

  @IsEnum(BookingStatus)
  status: BookingStatus;

  @IsOptional()
  @IsPhoneNumber()
  phone: string;

  @IsEnum(Gender)
  @IsNotEmpty()
  gender: Gender;

  @IsOptional()
  @IsUrl()
  profilePicture: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @ValidateNested()
  @ArrayMinSize(1)
  @Type(() => BookingItemDto)
  bookingItems: BookingItemDto[];

  @IsNotEmpty()
  @IsPositive()
  startTime: number;
}
