import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateQuickSaleDto {
  //   @IsOptional()
  //   clientId: string;

  @IsOptional()
  notes: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  productIds: number[];
}
