import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class CreatePasswordDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}
