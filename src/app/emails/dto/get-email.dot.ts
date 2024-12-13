import { IsDateString, IsNotEmpty, IsOptional } from 'class-validator';

export class GetEmailDto {
  @IsNotEmpty()
  @IsDateString()
  startDate: Date;

  @IsNotEmpty()
  @IsDateString()
  endDate: Date;
}
