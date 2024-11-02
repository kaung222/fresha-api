import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { PaginationResponse } from '@/utils/paginate-res.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}
  create(orgId: number, createProductDto: CreateProductDto) {
    const createProduct = this.productRepository.create({
      ...createProductDto,
      organization: { id: orgId },
    });
    return this.productRepository.save(createProduct);
  }

  async findAll(orgId: number) {
    let page = 1;
    const [data, totalCount] = await this.productRepository.findAndCount({
      where: { organization: { id: orgId } },
      take: 10,
    });
    return new PaginationResponse({ data, page, totalCount }).toResponse();
  }

  findOne(id: number) {
    return this.productRepository.findOneBy({ id });
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return this.productRepository.update(id, updateProductDto);
  }

  remove(id: number) {
    return this.productRepository.delete(id);
  }

  async checkOwnership(id: number, orgId: number) {
    const product = await this.productRepository.findOneBy({
      id,
      organization: { id: orgId },
    });
    if (!product) throw new NotFoundException('Product not found');
    return true;
  }
}
