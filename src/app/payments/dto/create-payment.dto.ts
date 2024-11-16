import { IsEnum, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
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
}
