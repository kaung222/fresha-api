import { Gender } from '@/app/users/entities/user.entity';
import {
  IsDate,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  IsUrl,
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

  @IsUrl()
  @IsOptional()
  profilePicture?: string;

  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  dob: Date;
}

export class LoginWithGoogle {
  @IsNotEmpty()
  @IsString()
  token: string;
}
