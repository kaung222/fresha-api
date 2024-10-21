import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
}
