import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClosedDayDto {
  @IsDate()
  @IsNotEmpty()
  startDate: string;

  @IsDate()
  @IsNotEmpty()
  endDate: string;

  @IsOptional()
  @IsString()
  notes: string;

  @IsOptional()
  @IsString()
  type: string;
}
