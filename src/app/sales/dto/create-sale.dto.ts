import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSaleDto {
  @IsNotEmpty()
  totalPrice: number;

  @IsNotEmpty()
  username: string;

  @IsOptional()
  notes: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  productIds: number[];
}
