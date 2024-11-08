import { IsEnum, IsNotEmpty, IsNumber, IsPositive, Max } from 'class-validator';
import { DayOfWeek } from '../entities/member-schedule.entity';

export class CreateMemberScheduleDto {
  @IsNotEmpty()
  @Max(86400)
  @IsPositive()
  startTime: number; // in second eg: 01:00:00 am = 3600 in second

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Max(86400)
  endTime: number; // in second

  @IsNotEmpty()
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsNotEmpty()
  memberId: number;
}
