import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export enum ServiceGender {
  maleOnly = 'Male Only',
  femaleOnly = 'Female Only',
  all = 'All',
}

export class CreateServiceDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  type: string;

  @IsNotEmpty()
  categoryId: string;

  @IsNotEmpty()
  @Min(0)
  @Max(1000000)
  price: number;

  @IsNotEmpty()
  duration: number; //in minutes

  @ApiProperty({ default: ServiceGender.all, enum: ServiceGender })
  gender: ServiceGender;

  @IsOptional()
  @MaxLength(255)
  notes: string;

  @ApiProperty({ example: '[memberId1,memberId2]' })
  @IsNotEmpty()
  @ArrayMinSize(1)
  @IsString()
  members: string[];
}
