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
  ValidateNested,
} from 'class-validator';
import { BookingStatus } from '../entities/appointment.entity';
import { Gender } from '@/app/users/entities/user.entity';
import { Type } from 'class-transformer';
import { ClientAppointmentDto } from './create-client-booking.dto';

class BookingItem {
  @IsNotEmpty()
  serviceId: number;

  @IsNotEmpty()
  memberId: number;
}
export class CreateAppointmentDto extends ClientAppointmentDto {
  @IsNotEmpty()
  orgId: number;
}
