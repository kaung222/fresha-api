import { IsDateString, IsNotEmpty, IsString, Min } from 'class-validator';

export class RescheduleBookingDto {
  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsNotEmpty()
  @Min(0)
  startTime: number;

  @IsNotEmpty()
  @IsDateString()
  date: Date;
}
