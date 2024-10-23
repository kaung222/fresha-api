import { IsEmail, IsNotEmpty, IsString, Min } from 'class-validator';

export class ConfirmOTPDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  otp: string;
}
