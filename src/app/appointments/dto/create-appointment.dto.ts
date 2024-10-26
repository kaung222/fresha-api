import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  ValidateNested,
} from 'class-validator';
import { BookingStatus, GenderEnum } from '../entities/appointment.entity';
import { Type } from 'class-transformer';

class BookingItem {
  @IsNotEmpty()
  serviceId: number;

  @IsOptional()
  memberId: number;
}
export class CreateAppointmentDto {
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

  @IsEnum(GenderEnum)
  gender: GenderEnum;

  @IsEmail()
  email: string;

  @ValidateNested({ each: true })
  @Type(() => BookingItem)
  bookingItems: BookingItem[];

  @IsNotEmpty()
  orgId: number;
}
