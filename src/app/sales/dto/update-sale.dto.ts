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
  productId: number;

  @IsNotEmpty()
  @IsPositive()
  quantity: number;
}
export class UpdateQuickSaleDto {
  @IsOptional()
  notes: string;

  @IsOptional()
  username: string;

  @IsNotEmpty()
  @ValidateNested()
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => SaleItemDto)
  saleItems: SaleItemDto[];
}
