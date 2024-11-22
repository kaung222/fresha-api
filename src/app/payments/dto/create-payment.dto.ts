import { Product } from '@/app/products/entities/product.entity';
import { PaymentMethod } from '../entities/payment.entity';
import { Service } from '@/app/services/entities/service.entity';

export class CreatePaymentBySystem {
  tips: number;
  commissionFees?: number;
  clientName: string;
  method: PaymentMethod;
  amount: number;
  memberId: number;
  services?: Service[];
  orgId: number;
}

export class CreateProductPayment {
  clientName: string;
  method: PaymentMethod;
  amount: number;
  products?: Product[];
  orgId: number;
}
