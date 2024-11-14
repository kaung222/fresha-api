import { Injectable } from '@nestjs/common';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductCategory } from './entities/product-category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductCategoryService {
  constructor(
    @InjectRepository(ProductCategory)
    private categoryRepository: Repository<ProductCategory>,
  ) {}
  async create(
    orgId: number,
    createProductCategoryDto: CreateProductCategoryDto,
  ) {
    const { name, notes } = createProductCategoryDto;
    const existCategory = await this.categoryRepository.findOneBy({
      name,
      orgId,
    });
    if (existCategory) return existCategory;
    const createCategory = this.categoryRepository.create({
      name,
      notes,
      orgId,
    });
    return this.categoryRepository.save(createCategory);
  }

  findAll(orgId: number) {
    return this.categoryRepository.findBy({ orgId });
  }

  findOne(id: number) {
    return this.categoryRepository.findOneBy({ id });
  }

  update(id: number, updateProductCategoryDto: UpdateProductCategoryDto) {
    return this.categoryRepository.update({ id }, updateProductCategoryDto);
  }

  remove(id: number) {
    return this.categoryRepository.delete({ id });
  }

  async checkOwnership(categoryId: number, orgId: number) {
    return await this.categoryRepository.findOneByOrFail({
      id: categoryId,
      orgId,
    });
  }
}
