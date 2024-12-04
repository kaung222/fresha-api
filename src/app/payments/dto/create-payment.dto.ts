import { PaymentMethod } from '../entities/payment.entity';

export class CreateBookingPaymentBySystem {
  clientName: string;
  method: PaymentMethod;
  amount: number;
  appointmentId: string;
  orgId: number;
  notes?: string;
}

export class CreateSalePayment {
  notes?: string;
  clientName: string;
  method: PaymentMethod;
  amount: number;
  saleId: string;
  orgId: number;
}
