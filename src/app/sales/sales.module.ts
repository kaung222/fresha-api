import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { Payment } from '../payments/entities/payment.entity';
import { PaymentsService } from '../payments/payments.service';
import { SaleQueue } from './sale.queue';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'SaleQueue' }),
    TypeOrmModule.forFeature([Sale, SaleItem, Payment]),
  ],
  controllers: [SalesController],
  providers: [SalesService, PaymentsService, SaleQueue],
})
export class SalesModule {}
