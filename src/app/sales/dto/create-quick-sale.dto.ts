import { PaymentMethod } from '@/app/payments/entities/payment.entity';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class SaleItemDto {
  @IsNotEmpty()
  productId: string;

  @IsNotEmpty()
  @IsPositive()
  quantity: number;
}
export class CreateQuickSaleDto {
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

  @IsNotEmpty()
  @IsBoolean()
  savePayment: boolean;

  @ValidateIf((obj) => obj.savePayment === true)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  paymentNotes: string;
}
