import { IsNotEmpty, IsString } from 'class-validator';

export class CancelBookingDto {
  @IsNotEmpty()
  @IsString()
  reason: string;
}
