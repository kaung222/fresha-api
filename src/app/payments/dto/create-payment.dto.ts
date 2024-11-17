import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { PaymentMethod } from '../entities/payment.entity';

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

  @IsNotEmpty()
  memberId: number;

  @IsOptional()
  serviceIds: number[];

  @IsOptional()
  packageIds: number[];

  @IsOptional()
  productIds: number[];
}
