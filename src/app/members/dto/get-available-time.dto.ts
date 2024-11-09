import { IsDate, IsNotEmpty } from 'class-validator';

export class GetAvailableTimes {
  @IsNotEmpty()
  @IsDate()
  startDate: Date;

  @IsDate()
  @IsNotEmpty()
  endDate: Date;
}
