import {
  IsDate,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  MinDate,
} from 'class-validator';
import { Gender } from '../entities/user.entity';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email: string;

  @IsNotEmpty()
  password?: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsUrl()
  profilePicture?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsDateString()
  // example value : 2000-03-02
  // @Transform(({ value }) => new Date(value))
  // @MinDate(new Date(12 / 22 / 2010))
  @IsOptional()
  dob?: Date;
}
