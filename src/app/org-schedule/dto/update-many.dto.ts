import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsPositive,
  ValidateNested,
} from 'class-validator';

class Schedule {
  @IsOptional()
  id: number;

  @IsNotEmpty()
  @IsPositive()
  startTime: number; // in second eg: 01:00:00 am = 3600 in second

  @IsNotEmpty()
  @IsPositive()
  endTime: number;
}
export class UpdateMultiScheduleDto {
  @ValidateNested()
  @Type(() => Schedule)
  schedules: Schedule[];
}
