import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';

class TimePeriod {
  @IsNotEmpty()
  startTime: number;
  @IsNotEmpty()
  endTime: number;
}
class OneDayDuty {
  @IsNotEmpty()
  workingHours: TimePeriod;

  @IsOptional()
  breakTimes?: TimePeriod[];
}
export class CreateOrgScheduleDto {
  @ValidateNested()
  @Type(() => TimePeriod)
  @IsNotEmpty()
  monday: TimePeriod;

  @ValidateNested()
  @Type(() => TimePeriod)
  @IsNotEmpty()
  tuesday: TimePeriod;

  @ValidateNested()
  @Type(() => TimePeriod)
  @IsNotEmpty()
  wednesday: TimePeriod;

  @ValidateNested()
  @Type(() => TimePeriod)
  @IsNotEmpty()
  thursday: TimePeriod;

  @ValidateNested()
  @Type(() => TimePeriod)
  @IsNotEmpty()
  friday: TimePeriod;

  @ValidateNested()
  @Type(() => TimePeriod)
  @IsNotEmpty()
  saturday: TimePeriod;

  @ValidateNested()
  @Type(() => TimePeriod)
  @IsNotEmpty()
  sunday: TimePeriod;
}
