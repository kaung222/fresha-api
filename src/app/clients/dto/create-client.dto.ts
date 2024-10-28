import { Gender } from '@/app/users/entities/user.entity';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class CreateClientDto {
  @IsNotEmpty()
  firstName: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsUrl()
  profilePicture?: string;

  @IsEnum(Gender)
  gender?: Gender;

  dob: Date;

  @IsOptional()
  userId?: number;
}
