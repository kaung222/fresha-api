import { IsEmail, IsNotEmpty, Min } from 'class-validator';

export class ConfirmOTPDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Min(6)
  otp: string;
}
