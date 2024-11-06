import { IsNotEmpty, IsPositive } from 'class-validator';

export class UpdateOrgScheduleDto {
  @IsNotEmpty()
  @IsPositive()
  startTime: number; // in second eg: 01:00:00 am = 3600 in second

  @IsNotEmpty()
  @IsPositive()
  endTime: number;
}
