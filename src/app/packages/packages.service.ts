import { Injectable } from '@nestjs/common';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DiscountType, Package } from './entities/package.entity';
import { DataSource, In, Repository } from 'typeorm';
import { Service } from '../services/entities/service.entity';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package) private packageRepository: Repository<Package>,

    private readonly dataSource: DataSource,
  ) {}

  // create a package
  async create(orgId: number, createPackageDto: CreatePackageDto) {
    const { serviceIds, description, discount, discountType, name } =
      createPackageDto;
    const services = await this.getSerices(serviceIds);
    const createPackage = this.packageRepository.create({
      description,
      discount,
      discountType,
      name,
      services,
      price: this.calculatePrice(services, discount, discountType),
      organization: { id: orgId },
    });
    return this.packageRepository.save(createPackage);
  }

  findAll(orgId: number) {
    return this.packageRepository.findBy({
      organization: { id: orgId },
    });
  }

  findOne(id: number) {
    return this.packageRepository.findOneBy({
      id,
    });
  }

  async update(id: number, updatePackageDto: UpdatePackageDto) {
    const { serviceIds, discount, discountType, description, name } =
      updatePackageDto;
    const services = await this.getSerices(serviceIds);
    const createPackage = this.packageRepository.create({
      price: this.calculatePrice(services, discount, discountType),
      services: services,
      description,
      discount,
      name,
      discountType,
      id,
    });
    return this.packageRepository.save(createPackage);
  }

  remove(id: number) {
    return this.packageRepository.delete(id);
  }

  private async getSerices(ids: number[]) {
    return this.dataSource.getRepository(Service).findBy({ id: In(ids) });
  }

  private calculatePrice(
    services: Service[],
    discount = 0,
    discountType: DiscountType,
  ) {
    if (discountType === DiscountType.free) {
      return 0;
    }
    const totalPrice = services.reduce((pv, cv) => pv + cv.price, 0);
    if (discountType === DiscountType.fixed) {
      totalPrice - discount;
    }
    const packagePrice = (totalPrice * discount) / 100;
    return packagePrice;
  }
}
