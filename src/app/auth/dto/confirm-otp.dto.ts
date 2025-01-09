import { IsNotEmpty } from 'class-validator';

export class ConfirmOTPDto {
  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  otp: string;
}
