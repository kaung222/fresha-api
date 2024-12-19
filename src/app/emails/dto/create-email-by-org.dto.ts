import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { MailTo } from '../entities/email.entity';

export class CreateEmailByOrg {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsEnum(MailTo)
  @IsNotEmpty()
  mailTo: MailTo;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  to: string[];
}
