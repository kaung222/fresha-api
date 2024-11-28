import { PaymentMethod } from '@/app/payments/entities/payment.entity';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CompleteAppointmentDto {
  @IsNotEmpty()
  @IsNumber()
  commissionFees: number;

  @IsOptional()
  @IsString()
  notes: string;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsNotEmpty()
  @IsNumber()
  tips: number;
}
