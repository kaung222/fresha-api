import { IsDateString, IsNotEmpty } from 'class-validator';

export class GetAppointmentDto {
  @IsNotEmpty()
  startDate: string;

  @IsNotEmpty()
  endDate: string;
}
