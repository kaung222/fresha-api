import { Injectable } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
  ) {}
  create(orgId: number, createBrandDto: CreateBrandDto) {
    const createBrand = this.brandRepository.create({
      ...createBrandDto,
      orgId,
    });
    return this.brandRepository.save(createBrand);
  }

  findAll(orgId: number) {
    return this.brandRepository.findBy({ orgId });
  }

  findOne(id: number) {
    return this.brandRepository.findOneBy({ id });
  }

  update(id: number, updateBrandDto: UpdateBrandDto) {
    return this.brandRepository.update({ id }, updateBrandDto);
  }

  remove(id: number) {
    return this.brandRepository.delete({ id });
  }

  async checkOwnership(brandId: number, orgId: number) {
    return await this.brandRepository.findOneByOrFail({ id: brandId, orgId });
  }
}
