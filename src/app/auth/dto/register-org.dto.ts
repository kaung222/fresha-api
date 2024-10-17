import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterOrgDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  phone: string;
}
