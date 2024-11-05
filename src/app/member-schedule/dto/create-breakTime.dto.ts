import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';

class BreakTime {
  @IsNotEmpty()
  startTime: number;

  @IsNotEmpty()
  endTime: number;
}
export class CreateBreakTimeDto {
  @ValidateNested()
  @Type(() => BreakTime)
  breakTimes: BreakTime[];
}
