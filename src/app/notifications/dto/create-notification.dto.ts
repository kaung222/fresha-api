import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateNotificationDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  body: string;

  @IsNotEmpty()
  type: string;

  @IsNotEmpty()
  link?: string;

  @IsNotEmpty()
  userId: string;

  @IsOptional()
  thumbnail?: string;
}
