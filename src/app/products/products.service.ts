import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { PaginationResponse } from '@/utils/paginate-res.dto';
import { DiscountType } from '../services/entities/service.entity';
import { FilesService } from '../files/files.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly filesService: FilesService,
  ) {}
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
    this.filesService.updateFileAsUsed(images);
    return {
      message: 'Product created successfully',
    };
  }

  async findAll(orgId: number) {
    let page = 1;
    const [data, totalCount] = await this.productRepository.findAndCount({
      where: { orgId },
      take: 10,
    });
    return new PaginationResponse({ data, page, totalCount }).toResponse();
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
      await this.filesService.updateFileAsUsed(images);
      this.filesService.updateFileAsUnused(product.images);
    }
    return {
      message: 'Update product successfully',
    };
  }

  async remove(id: string, orgId: number) {
    await this.getProductById(id, orgId);
    return this.productRepository.delete(id);
  }

  private async getProductById(id: string, orgId: number) {
    const product = await this.productRepository.findOneBy({ id, orgId });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }
}
