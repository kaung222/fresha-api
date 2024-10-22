import { IsEmail, IsNotEmpty } from 'class-validator';

export class GetOTPDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
