import { DiscountType } from '@/app/services/entities/service.entity';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateProductDto {
  @IsOptional()
  @IsString({ each: true })
  images: string[];

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsPositive()
  price: number;

  @IsOptional()
  @IsString()
  brand: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  stock: number;

  @IsOptional()
  @IsPositive()
  moq: number;

  @IsNotEmpty()
  @IsPositive()
  discount: number;

  @IsEnum(DiscountType)
  @IsNotEmpty()
  discountType: DiscountType;
}
