import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  Max,
  Min,
} from 'class-validator';
import { PriceType, TargetGender } from '../entities/service.entity';

export class UpdateServiceDto {
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
  @IsNumber()
  @IsPositive()
  duration: number;

  @ApiProperty({ default: TargetGender.all, enum: TargetGender })
  @IsEnum(TargetGender)
  targetGender: TargetGender;

  @IsOptional()
  description: string;

  @ApiProperty({ example: '[memberId1,memberId2]' })
  @IsNotEmpty()
  @ArrayMinSize(1)
  memberIds: number[];

  @IsNotEmpty()
  @IsEnum(PriceType)
  priceType: PriceType;
}
