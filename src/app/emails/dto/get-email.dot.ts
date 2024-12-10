import { IsNotEmpty } from 'class-validator';

export class GetEmailDto {
  @IsNotEmpty()
  startDate: string;
  @IsNotEmpty()
  endDate: string;
}
