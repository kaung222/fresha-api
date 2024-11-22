import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { Repository } from 'typeorm';
import { CacheService, CacheTTL } from '@/global/cache.service';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    private readonly cacheService: CacheService,
  ) {}
  async create(orgId: number, createBrandDto: CreateBrandDto) {
    await this.IsExistingBrand(createBrandDto.name, orgId);
    const createBrand = this.brandRepository.create({
      ...createBrandDto,
      orgId,
    });

    this.brandRepository.save(createBrand);
    this.clearCache(orgId);
    return {
      message: 'Created brand successfully',
    };
  }

  getCacheKey(orgId: number) {
    return `${orgId}:brands`;
  }

  clearCache(orgId: number) {
    const cacheKey = this.getCacheKey(orgId);
    this.cacheService.del(cacheKey);
  }
  // check exiting brand
  async IsExistingBrand(brandName: string, orgId: number): Promise<boolean> {
    const brand = await this.brandRepository.findOneBy({
      name: brandName,
      orgId,
    });
    if (brand) throw new ForbiddenException('Brand already exist');
    return true;
  }

  async findAll(orgId: number) {
    const cacheKey = this.getCacheKey(orgId);
    const cachedBrand = await this.cacheService.get(cacheKey);
    if (cachedBrand) return cachedBrand;
    const brands = await this.brandRepository.findBy({ orgId });
    await this.cacheService.set(cacheKey, brands, CacheTTL.veryLong);
    return brands;
  }

  findOne(id: number) {
    return this.brandRepository.findOneBy({ id });
  }

  async update(id: number, updateBrandDto: UpdateBrandDto, orgId: number) {
    await this.getBrandById(id, orgId);
    await this.IsExistingBrand(updateBrandDto.name, orgId);
    await this.brandRepository.update({ id }, updateBrandDto);
    this.clearCache(orgId);
    return {
      message: 'Update brand successfully',
    };
  }

  async remove(id: number, orgId: number) {
    await this.getBrandById(id, orgId);
    await this.brandRepository.delete({ id });
    this.clearCache(orgId);
    return {
      message: 'Deleted brand successfully',
    };
  }

  async getBrandById(brandId: number, orgId: number) {
    const brand = await this.brandRepository.findOneByOrFail({
      id: brandId,
      orgId,
    });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }
}
