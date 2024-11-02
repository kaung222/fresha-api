import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateProductDto {
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

  @IsOptional()
  @IsPositive()
  moq: number;
}
