import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Max,
  ValidateNested,
} from 'class-validator';
import { DayOfWeek } from '../entities/member-schedule.entity';
import { Type } from 'class-transformer';

class MemberSchedule {
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
}

export class CreateMemberScheduleDto {
  @ValidateNested()
  @Type(() => MemberSchedule)
  memberSchedules: MemberSchedule[];

  @IsNotEmpty()
  memberId: number;
}
