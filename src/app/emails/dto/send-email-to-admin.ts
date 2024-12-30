import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class SendEmailToAdmin {
  @IsOptional()
  @IsEmail()
  from: string;

  @IsNotEmpty()
  text: string;

  @IsNotEmpty()
  subject: string;
}
