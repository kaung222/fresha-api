import { DiscountType } from '@/app/services/entities/service.entity';
import {
  ArrayMaxSize,
  ArrayMinSize,
  Contains,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @IsOptional()
  @IsString({ each: true })
  @ArrayMaxSize(8)
  @Contains('https://djiwkc53pq2w8.cloudfront.net/', {
    each: true,
    message: "only allowed baranie' images",
  })
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
  stock: number;

  @IsUrl()
  @IsNotEmpty()
  thumbnail: string;

  @IsOptional()
  @IsPositive()
  moq: number;

  @IsNotEmpty()
  @Min(0)
  discount: number;

  @IsEnum(DiscountType)
  @IsNotEmpty()
  discountType: DiscountType;
}
