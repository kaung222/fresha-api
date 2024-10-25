import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PriceType, TargetGender } from '../entities/service.entity';

export class CreateServiceDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  type: string;

  @IsNotEmpty()
  categoryId: number;

  @IsNotEmpty()
  @Min(0)
  @Max(1000000)
  price: number;

  @IsNotEmpty()
  duration: number; //in minutes

  @ApiProperty({ default: TargetGender.all, enum: TargetGender })
  @IsEnum(TargetGender)
  targerGender: TargetGender;

  @IsOptional()
  @MaxLength(255)
  notes: string;

  @ApiProperty({ example: '[memberId1,memberId2]' })
  @IsNotEmpty()
  @ArrayMinSize(1)
  memberIds: number[];

  @IsNotEmpty()
  @IsEnum(PriceType)
  priceType: PriceType;
}
