import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  ValidateNested,
} from 'class-validator';

export class SaleItemDto {
  @IsNotEmpty()
  productId: string;

  @IsNotEmpty()
  @IsPositive()
  quantity: number;
}

export class CreateSaleDto {
  @IsNotEmpty()
  username: string;

  @IsOptional()
  notes: string;

  @IsNotEmpty()
  @ValidateNested()
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => SaleItemDto)
  saleItems: SaleItemDto[];
}
