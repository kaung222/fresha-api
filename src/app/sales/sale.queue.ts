import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { SalesService } from './sales.service';
import { SaleItem } from './entities/sale-item.entity';

@Processor('SaleQueue')
export class SaleQueue {
  constructor(private readonly saleService: SalesService) {}
  @Process('ReduceStock')
  async reduceStockOnConfirm({ data }: Job<SaleItem[]>) {
    await this.saleService.reduceStock(data);
  }
}
