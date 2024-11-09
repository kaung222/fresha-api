import { IsDate, IsDateString, IsNotEmpty } from 'class-validator';

export class GetAvailableTimes {
  @IsNotEmpty()
  @IsDateString()
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  endDate: Date;
}
