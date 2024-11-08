import { DayOfWeek } from '@/app/member-schedule/entities/member-schedule.entity';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsPositive,
  ValidateNested,
} from 'class-validator';

class Schedule {
  @IsNotEmpty()
  @IsPositive()
  startTime: number; // in second eg: 01:00:00 am = 3600 in second

  @IsNotEmpty()
  @IsPositive()
  endTime: number;

  @IsNotEmpty()
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;
}
export class UpdateMultiScheduleDto {
  @ValidateNested()
  @Type(() => Schedule)
  schedules: Schedule[];

  @IsNotEmpty()
  memberId: number;
}
