import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class RegisterOrganizationDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'Business name' })
  name: string;

  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
}
