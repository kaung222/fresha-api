import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { PaymentMethod } from '../entities/payment.entity';
import { Service } from '@/app/services/entities/service.entity';
import { Product } from '@/app/products/entities/product.entity';

export class CreatePaymentDto {
  @IsNotEmpty()
  clientName: string;

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  method: PaymentMethod;

  @IsNotEmpty()
  @IsPositive()
  @IsNumber()
  amount: number;
}

export class CreatePaymentBySystem {
  clientName: string;
  method: PaymentMethod;
  amount: number;
  memberId: number;
  services?: Service[];
  products?: Product[];
  orgId: number;
}
