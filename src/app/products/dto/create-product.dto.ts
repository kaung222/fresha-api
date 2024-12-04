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
  brand: string;

  @IsOptional()
  description: string;

  @IsOptional()
  category: string;

  @IsOptional()
  @IsBoolean()
  instock: boolean;

  @IsNotEmpty()
  @IsInt()
  stock: number;

  @IsOptional()
  @IsPositive()
  moq: number;

  @IsNotEmpty()
  discount: number;

  @IsEnum(DiscountType)
  @IsNotEmpty()
  discountType: DiscountType;
}
