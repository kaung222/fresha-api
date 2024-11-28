import { PaymentMethod } from '@/app/payments/entities/payment.entity';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CompleteAppointmentDto {
  @IsNotEmpty()
  @IsNumber()
  commissionFees: number;

  @IsOptional()
  @IsString()
  notes: string;

  @IsNotEmpty()
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @IsNotEmpty()
  @IsNumber()
  tips: number;
}
