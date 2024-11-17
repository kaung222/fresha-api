import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, SaleItem])],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
