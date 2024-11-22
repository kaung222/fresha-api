import { PaymentMethod } from '@/app/payments/entities/payment.entity';

export class CompleteAppointmentDto {
  comissionFees: number;
  notes: string;
  tips: number;
  paymentMethod: PaymentMethod;
}
