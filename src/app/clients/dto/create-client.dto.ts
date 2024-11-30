import { Gender } from '@/app/users/entities/user.entity';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateClientDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsOptional()
  lastName?: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @IsOptional()
  @IsUrl()
  profilePicture?: string;

  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  dob: string;
}
