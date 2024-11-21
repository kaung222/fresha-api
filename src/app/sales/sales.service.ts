import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class SalesService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Sale) private readonly saleRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private saleItemRepository: Repository<SaleItem>,
  ) {}
  async create(orgId: number, createSaleDto: CreateSaleDto) {
    const { saleItems, ...rest } = createSaleDto;
    const createSale = this.saleRepository.create({
      ...rest,
      orgId,
    });
    const sale = await this.saleRepository.save(createSale);
    const items = await this.saveSaleItems(sale, saleItems);
    const { totalPrice } = this.calculateTotalPrice(items);
    sale.totalPrice = totalPrice;
    return this.saleRepository.save(sale);
  }

  async createQuickSale(orgId: number, createQuickSaleDto: CreateQuickSaleDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const { saleItems, ...rest } = createQuickSaleDto;
      const createSale = this.saleRepository.create({
        ...rest,
        organization: { id: orgId },
      });
      const sale = await this.saleRepository.save(createSale);
      const items = await this.saveSaleItems(sale, saleItems);
      const { totalPrice } = this.calculateTotalPrice(items);
      sale.totalPrice = totalPrice;
      await this.saleRepository.save(sale);
      await queryRunner.commitTransaction();
      return {
        message: 'Create sale successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  private async saveSaleItems(sale: Sale, saleItems: SaleItemDto[]) {
    const productIds = saleItems.map((item) => item.productId);
    const products = await this.getProductsByIds(productIds);
    if (products.length == 0) throw new NotFoundException('Products not found');
    const createSaleItems = this.saleItemRepository.create(
      saleItems.map(({ productId, quantity }) => {
        const product = products.find((product) => product.id === productId);
        // add some discrount here
        const subtotalPrice = product.price * quantity;
        return {
          product,
          quantity,
          name: product.name,
          price: product.price,
          sale,
          subtotalPrice,
        };
      }),
    );
    return await this.saleItemRepository.save(createSaleItems);
  }

  private async getProductsByIds(productIds: number[]) {
    return await this.dataSource
      .getRepository(Product)
      .findBy({ id: In(productIds) });
  }
  private calculateTotalPrice(items: SaleItem[]) {
    const totalPrice = items.reduce((pv, cv) => pv + cv.subtotalPrice, 0);
    return {
      totalPrice,
    };
  }

  async findAll(orgId: number, paginateQuery: PaginateQuery) {
    console.log(paginateQuery);
    const { page } = paginateQuery;
    const [data, totalCount] = await this.saleRepository.findAndCount({
      where: { organization: { id: orgId } },
      take: 10,
      skip: 10 * (page - 1),
    });
    return new PaginationResponse({ data, totalCount, page }).toResponse();
  }

  findOne(id: number, orgId: number) {
    return this.saleRepository.findOneOrFail({
      where: { id, organization: { id: orgId } },
      relations: {
        client: true,
      },
    });
  }

  async update(id: number, updateSaleDto: UpdateQuickSaleDto, orgId: number) {
    const { saleItems, ...rest } = updateSaleDto;
    const sale = await this.getSaleById(id, orgId, true);
    const items = await this.saveSaleItems(sale, saleItems);
    Object.assign(sale, rest);
    sale.saleItems = items;
    return this.saleRepository.save(sale);
  }

  async remove(id: number, orgId: number) {
    await this.getSaleById(id, orgId);
    return this.saleRepository.delete({ id });
  }

  async getSaleById(
    saleId: number,
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
}
