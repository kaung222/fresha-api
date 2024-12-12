import { IsDate, IsDateString, IsNotEmpty } from 'class-validator';

export class GetAppointmentDto {
  @IsNotEmpty()
  // @IsDate()
  @IsDateString()
  startDate: Date;

  @IsNotEmpty()
  // @IsDate()
  @IsDateString()
  endDate: Date;
}
