import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateQuickSaleDto } from './dto/update-sale.dto';
import { CreateQuickSaleDto, SaleItemDto } from './dto/create-quick-sale.dto';
import { DataSource, In, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { PaginateQuery } from '@/utils/paginate-query.dto';
import { PaginationResponse } from '@/utils/paginate-res.dto';
import { SaleItem } from './entities/sale-item.entity';
import { CreateSalePayment } from '../payments/dto/create-payment.dto';
import { PaymentsService } from '../payments/payments.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class SalesService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly paymentService: PaymentsService,
    @InjectRepository(Sale) private readonly saleRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private saleItemRepository: Repository<SaleItem>,
    @InjectQueue('SaleQueue') private saleQueue: Queue,
  ) {}

  async create(orgId: number, createQuickSaleDto: CreateQuickSaleDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const { saleItems, savePayment, paymentNotes, paymentMethod, ...rest } =
        createQuickSaleDto;
      const createSale = this.saleRepository.create({
        ...rest,
        orgId,
      });
      const sale = await this.saleRepository.save(createSale);
      const items = await this.saveSaleItems(sale, saleItems);
      const totalPrice = this.calculateTotalPrice(items);
      sale.totalPrice = totalPrice;

      await this.saleRepository.save(sale);
      await queryRunner.commitTransaction();

      // create payment on creating quick sale
      if (savePayment)
        this.createPayment({
          amount: totalPrice,
          clientName: 'unknown',
          method: paymentMethod,
          notes: paymentNotes,
          orgId,
          saleId: sale.id,
        });
      await this.saleQueue.add('ReduceStock', items);
      return {
        message: 'Create sale successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new ForbiddenException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  createPayment(createPaymentBySales: CreateSalePayment) {
    this.paymentService.createPaymentBySales(createPaymentBySales);
  }

  private async saveSaleItems(sale: Sale, saleItems: SaleItemDto[]) {
    const productIds = saleItems.map((item) => item.productId);
    const products = await this.getProductsByIds(productIds);
    const createSaleItems = this.saleItemRepository.create(
      saleItems.map(({ productId, quantity }) => {
        const product = products.find((product) => product.id === productId);
        if (product.stock < quantity)
          throw new ForbiddenException('Not enought stock');
        // add some discount here
        const subtotalPrice = product.discountPrice * quantity;
        return {
          product,
          quantity,
          name: product.name,
          price: product.discountPrice,
          sale,
          subtotalPrice,
        };
      }),
    );
    return await this.saleItemRepository.save(createSaleItems);
  }

  private async getProductsByIds(productIds: string[]) {
    const products = await this.dataSource
      .getRepository(Product)
      .findBy({ id: In(productIds) });
    if (productIds.length !== products.length)
      throw new NotFoundException('Some Products are missing');
    return products;
  }

  // calculate total price by sale itmes
  private calculateTotalPrice(items: SaleItem[]) {
    return items.reduce((pv, cv) => pv + cv.subtotalPrice, 0);
  }

  async findAll(orgId: number, paginateQuery: PaginateQuery) {
    const { page = 1 } = paginateQuery;
    const [data, totalCount] = await this.saleRepository.findAndCount({
      where: { orgId },
      relations: { saleItems: true },
      take: 10,
      skip: 10 * (page - 1),
    });
    return new PaginationResponse({ data, totalCount, page }).toResponse();
  }

  async findOne(id: string, orgId: number) {
    const sale = await this.saleRepository.findOne({
      where: { id, orgId },
      relations: {
        saleItems: { product: true },
      },
    });
    if (!sale) throw new NotFoundException('sale not found');
    return sale;
  }

  async update(id: string, updateSaleDto: UpdateQuickSaleDto, orgId: number) {
    return {
      error: true,
      message: 'Cannot update sale',
    };
    const { saleItems, ...rest } = updateSaleDto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const sale = await this.getSaleById(id, orgId, true);
      const items = await this.saveSaleItems(sale, saleItems);
      Object.assign(sale, rest);
      sale.saleItems = items;
      const newSale = await this.saleRepository.save(sale);
      await queryRunner.commitTransaction();
      // this.paymentService.update()
      return {
        message: 'Update sale successfully',
        sale: newSale,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new ForbiddenException('Cannot update sale');
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string, orgId: number) {
    await this.getSaleById(id, orgId);
    return this.saleRepository.delete({ id });
  }

  async getSaleById(
    saleId: string,
    orgId: number,
    saleItems_include?: boolean,
  ) {
    return await this.saleRepository.findOne({
      where: { id: saleId, orgId },
      relations: {
        saleItems: saleItems_include,
      },
    });
  }

  async reduceStock(saleItems: SaleItem[]) {
    try {
      await Promise.all(
        saleItems.map(async ({ productId, quantity }) => {
          await this.dataSource
            .getRepository(Product)
            .decrement({ id: productId }, 'stock', quantity);
        }),
      );
    } catch (error) {
      console.log('error reducing stock', error);
    }
  }
}
