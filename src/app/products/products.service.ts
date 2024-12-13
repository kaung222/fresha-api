import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { PaginationResponse } from '@/utils/paginate-res.dto';
import { DiscountType } from '../services/entities/service.entity';
import { FilesService } from '../files/files.service';
import { PaginateQuery } from '@/utils/paginate-query.dto';
import { CacheService, CacheTTL } from '@/global/cache.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly filesService: FilesService,
    private cacheService: CacheService,
  ) {}
  // product create
  async create(orgId: number, createProductDto: CreateProductDto) {
    const { discountType, discount, price, images } = createProductDto;
    const discountPrice = this.calculateDiscountPrice(
      price,
      discount,
      discountType,
    );
    const createProduct = this.productRepository.create({
      ...createProductDto,
      discountPrice,
      organization: { id: orgId },
    });
    await this.productRepository.save(createProduct);
    this.filesService.updateFileAsUsed(images, orgId);
    this.cacheService.del(this.getCacheKey(orgId));
    return {
      message: 'Product created successfully',
    };
  }

  async findAll(orgId: number, paginateQuery: PaginateQuery) {
    const { page = 1 } = paginateQuery;
    const cacheKey = this.getCacheKey(orgId, page);
    const dataInCache = await this.cacheService.get(cacheKey);
    if (dataInCache) return dataInCache;
    const [data, totalCount] = await this.productRepository.findAndCount({
      where: { orgId },
      skip: 10 * (page - 1),
      take: 10,
      order: { updatedAt: 'DESC' },
    });
    const response = new PaginationResponse({
      data,
      page,
      totalCount,
    }).toResponse();
    this.cacheService.set(cacheKey, response, CacheTTL.veryLong);
    return response;
  }

  private getCacheKey(orgId: number, page = 1) {
    return `products:${orgId}:${page}`;
  }

  findOne(id: string) {
    return this.productRepository.findOneBy({ id });
  }

  calculateDiscountPrice(
    price: number,
    discount: number,
    discountType: DiscountType,
  ) {
    if (discountType === DiscountType.fixed) return price - discount;
    else return price - (price * discount) / 100;
  }

  async update(id: string, updateProductDto: UpdateProductDto, orgId: number) {
    const { price, discount, discountType, images } = updateProductDto;
    const product = await this.getProductById(id, orgId);
    const discountPrice = this.calculateDiscountPrice(
      price,
      discount,
      discountType,
    );
    const newUpdate = this.productRepository.create({
      id: product.id,
      ...updateProductDto,
      discountPrice,
    });
    await this.productRepository.save(newUpdate);
    if (images !== product.images) {
      this.filesService.updateFileAsUsed(images, orgId);
      this.filesService.updateFileAsUnused(product.images, orgId);
    }
    this.cacheService.del(this.getCacheKey(orgId));
    return {
      message: `Update product ${product.name} successfully`,
    };
  }

  async remove(id: string, orgId: number) {
    const product = await this.getProductById(id, orgId);
    await this.productRepository.delete({ id });
    this.filesService.updateFileAsUnused(product.images, orgId);
    this.cacheService.del(this.getCacheKey(orgId));
    return {
      message: `Deleted product ${product.name} successfully`,
    };
  }

  private async getProductById(id: string, orgId: number) {
    const product = await this.productRepository.findOneBy({ id, orgId });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }
}
