import { PaymentMethod } from '../entities/payment.entity';

export class CreateBookingPaymentBySystem {
  clientName: string;
  method: PaymentMethod;
  amount: number;
  appointmentId: number;
  orgId: number;
  tips: number;
  notes?: string;
}

export class CreateSalePayment {
  notes?: string;
  clientName: string;
  method: PaymentMethod;
  amount: number;
  saleId: number;
  orgId: number;
}
