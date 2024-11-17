import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
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
  create(userId: number, createSaleDto: CreateSaleDto) {
    return this.saleRepository.create(createSaleDto);
  }

  async createQuickSale(orgId: number, createQuickSaleDto: CreateQuickSaleDto) {
    const { saleItems, ...rest } = createQuickSaleDto;
    const createSale = this.saleRepository.create({
      ...rest,
      organization: { id: orgId },
    });
    const sale = await this.saleRepository.save(createSale);
    const productIds = saleItems.map((item) => item.productId);
    const products = await this.getProductsByIds(productIds);
    if (products.length == 0) throw new NotFoundException('Products not found');
    const items = await this.saveSaleItems(sale, saleItems, products);
    const { totalPrice } = this.calculateTotalPrice(items);
    sale.totalPrice = totalPrice;
    return this.saleRepository.save(sale);
  }

  private async saveSaleItems(
    sale: Sale,
    saleItems: SaleItemDto[],
    products: Product[],
  ) {
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

  update(id: number, updateSaleDto: UpdateSaleDto) {
    return `This action updates a #${id} sale`;
  }

  remove(id: number) {
    return this.saleRepository.delete({ id });
  }

  async checkOwnership(saleId: number, orgId: number) {
    return await this.saleRepository.findOneByOrFail({
      organization: { id: orgId },
      id: saleId,
    });
  }
}
