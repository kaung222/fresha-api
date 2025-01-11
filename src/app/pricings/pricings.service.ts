import { Injectable } from '@nestjs/common';
import { CreatePricingDto } from './dto/create-pricing.dto';
import { UpdatePricingDto } from './dto/update-pricing.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Pricing } from './entities/pricing.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PricingsService {
  constructor(
    @InjectRepository(Pricing)
    private readonly pricingRepository: Repository<Pricing>,
  ) {}
  create(createPricingDto: CreatePricingDto) {
    const newPricing = this.pricingRepository.create(createPricingDto);
    return this.pricingRepository.save(newPricing);
  }

  findAll() {
    return this.pricingRepository.find();
  }

  async findOne(id: number) {
    return await this.pricingRepository.findOneBy({ id });
  }

  update(id: number, updatePricingDto: UpdatePricingDto) {
    return this.pricingRepository.update(id, updatePricingDto);
  }

  remove(id: number) {
    return this.pricingRepository.delete({ id });
  }
}
