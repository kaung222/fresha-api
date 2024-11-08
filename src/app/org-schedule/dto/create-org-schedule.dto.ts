import { DayOfWeek } from '@/app/member-schedule/entities/member-schedule.entity';

import { IsEnum, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateOrgScheduleDto {
  @IsNotEmpty()
  @IsPositive()
  startTime: number;

  @IsNotEmpty()
  @IsPositive()
  endTime: number;

  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;
}
