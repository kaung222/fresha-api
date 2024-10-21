import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsPhoneNumber('MM')
  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}
