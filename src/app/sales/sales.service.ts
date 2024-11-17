import { Injectable } from '@nestjs/common';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { CreateQuickSaleDto } from './dto/create-quick-sale.dto';
import { DataSource, In, Repository } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Sale } from './entities/sale.entity';
import { PaginateQuery } from '@/utils/paginate-query.dto';
import { PaginationResponse } from '@/utils/paginate-res.dto';

@Injectable()
export class SalesService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Sale) private readonly saleRepository: Repository<Sale>,
  ) {}
  create(userId: number, createSaleDto: CreateSaleDto) {
    return this.saleRepository.create(createSaleDto);
  }

  async createQuickSale(orgId: number, createQuickSaleDto: CreateQuickSaleDto) {
    const { productIds, ...rest } = createQuickSaleDto;
    const products = await this.getProductsByIds(productIds);
    const { totalPrice } = this.calculateTotalPrice(products);
    const createSale = this.saleRepository.create({
      totalPrice,
      products,
      ...rest,
      organization: { id: orgId },
    });
    return this.saleRepository.save(createSale);
  }

  private async getProductsByIds(productIds: number[]) {
    return await this.dataSource
      .getRepository(Product)
      .findBy({ id: In(productIds) });
  }
  private calculateTotalPrice(products: Product[]) {
    const totalPrice = products.reduce((pv, cv) => pv + cv.price, 0);
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
        user: true,
        products: true,
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
