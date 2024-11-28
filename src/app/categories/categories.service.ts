import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Not, Repository } from 'typeorm';
import { CacheService, CacheTTL } from '@/global/cache.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Create a new category and clear the cache for the organization.
   */
  async create(createCategoryDto: CreateCategoryDto, orgId: number) {
    await this.IsExistingBrand(createCategoryDto.name, orgId);
    const newCategory = this.categoryRepository.create({
      ...createCategoryDto,
      organization: { id: orgId },
    });
    const category = await this.categoryRepository.save(newCategory);
    await this.clearCategoryCache(orgId);
    return {
      category,
      message: 'Category created successfully',
    };
  }

  /*
    check exiting category
   */
  async IsExistingBrand(categoryName: string, orgId: number): Promise<boolean> {
    const brand = await this.categoryRepository.findOneBy({
      name: categoryName,
      orgId,
    });
    if (brand) throw new ForbiddenException('Category already exist');
    return true;
  }

  /**
   * Retrieve all categories for the given organization, using cache if available.
   */
  async findAll(orgId: number) {
    const cacheKey = this.getCategoryCacheKey(orgId);
    const cachedCategories = await this.cacheService.get(cacheKey);
    if (cachedCategories) return cachedCategories;
    const categories = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.services', 'service')
      .where('category.orgId = :orgId', { orgId })
      // .andWhere('service.id IS NOT NULL')
      .getMany();
    await this.cacheService.set(cacheKey, categories, CacheTTL.long);
    return categories;
  }

  /**
   * Find a category by its ID.
   */
  async findOne(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: { services: { services: true } },
    });
    if (!category)
      throw new NotFoundException(`Category with ID ${id} not found`);
    return category;
  }

  /**
   * Update a category by its ID.
   */
  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
    orgId: number,
  ) {
    await this.getCategoryById(id, orgId);
    // await this.IsExistingBrand(updateCategoryDto.name, orgId);
    await this.categoryRepository.update(id, updateCategoryDto);
    await this.clearCategoryCache(orgId);
    return { message: 'Category updated successfully' };
  }

  /**
   * Remove a category by its ID.
   */
  async remove(id: number, orgId: number) {
    await this.getCategoryById(id, orgId);
    await this.categoryRepository.delete(id);
    this.clearCategoryCache(orgId);
    return { message: 'Category removed successfully' };
  }

  /**
   * Check if a category belongs to the given organization.
   */
  private async getCategoryById(id: number, orgId: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id, orgId },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  /**
   * Generate a cache key for categories.
   */
  private getCategoryCacheKey(orgId: number): string {
    return `${orgId}:categories`;
  }

  /**
   * Clear the cache for categories.
   */
  private async clearCategoryCache(orgId: number): Promise<void> {
    const cacheKey = this.getCategoryCacheKey(orgId);
    await this.cacheService.del(cacheKey);
  }
}
