import { BookingStatus } from '@/app/appointments/entities/appointment.entity';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class GetStatisticsDto {
  @IsNotEmpty()
  startDate: string;

  @IsNotEmpty()
  endDate: string;

  @IsEnum(BookingStatus)
  @IsOptional()
  status: BookingStatus;
}
