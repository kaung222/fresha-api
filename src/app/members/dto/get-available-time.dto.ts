import { IsDateString, IsNotEmpty } from 'class-validator';

export class GetAvailableTimes {
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}
