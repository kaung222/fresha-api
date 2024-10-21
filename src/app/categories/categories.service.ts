import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}
  create(createCategoryDto: CreateCategoryDto, creatorId: number) {
    const createCategory = this.categoryRepository.create({
      ...createCategoryDto,
      creatorId,
    });
    return this.categoryRepository.save(createCategory);
  }

  findAll(creatorId: number) {
    return this.categoryRepository.find({
      where: { creatorId },
    });
  }

  findOne(id: number) {
    return this.categoryRepository.findOneBy({ id });
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return this.categoryRepository.update(id, updateCategoryDto);
  }

  remove(id: number) {
    return this.categoryRepository.delete(id);
  }

  async checkOwnership(id: number, orgId: number): Promise<boolean> {
    const category = await this.categoryRepository.findOneBy({
      id,
      creatorId: orgId,
    });
    if (!category) throw new NotFoundException('category not found');
    return true;
  }
}
