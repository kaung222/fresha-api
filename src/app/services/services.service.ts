import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DiscountType, Service, ServiceType } from './entities/service.entity';
import { DataSource, In, Not, Repository } from 'typeorm';
import { Member } from '../members/entities/member.entity';
import { CreatePackageDto } from './dto/create-package.dto';
import { Category } from '../categories/entities/category.entity';
import { GetServicesDto } from './dto/get-service.dto';
import { CacheService } from '@/global/cache.service';
import { FilesService } from '../files/files.service';
import {
  deleteObjectAWS,
  updateObjectAsUsed,
  updateTagOfObject,
} from '@/utils/store-obj-s3';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    private readonly dataSource: DataSource,
    private cacheService: CacheService,
    private fileService: FilesService,
  ) {}

  // create new service
  async create(createServiceDto: CreateServiceDto, orgId: number) {
    const { memberIds, categoryId, ...rest } = createServiceDto;
    // use parallel query for efficient querying
    const [category, members] = await Promise.all([
      this.getCategoryById(categoryId, orgId),
      this.getMembersByIds(memberIds, orgId),
    ]);
    const discountPrice = this.calculateDiscountPrice(
      rest.price,
      rest.discount,
      rest.discountType,
    );
    const newService = this.serviceRepository.create({
      ...rest,
      discountPrice,
      type: ServiceType.service,
      members,
      category,
      organization: { id: orgId },
    });
    this.clearCache(orgId);
    this.updateCategoryUsage(category);
    const service = await this.serviceRepository.save(newService);
    await updateObjectAsUsed(service.thumbnailUrl);
    return {
      message: 'Create service successfully',
    };
  }

  private updateCategoryUsage(category: Category) {
    this.dataSource
      .getRepository(Category)
      .update({ id: category.id }, { serviceCount: category.serviceCount + 1 });
    this.clearCache(category.orgId);
  }
  private clearCache(orgId: number) {
    const cacheKey = this.getCacheKey(orgId);
    this.cacheService.del(cacheKey);
  }

  private getCacheKey(orgId: number) {
    return `${orgId}:categories`;
  }

  private calculateDiscountPrice(
    price: number,
    discount: number,
    discountType: DiscountType,
  ) {
    switch (discountType) {
      case DiscountType.fixed:
        return Math.max(price - discount, 0);
      case DiscountType.percent:
        return Math.max(price - (price * discount) / 100, 0);
      default:
        return price;
    }
  }

  async getCategoryById(categoryId: number, orgId: number) {
    const category = await this.dataSource
      .getRepository(Category)
      .findOneBy({ orgId, id: categoryId });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async getMembersByIds(memberIds: number[], orgId: number) {
    const members = await this.dataSource
      .getRepository(Member)
      .findBy({ id: In(memberIds), orgId });
    if (members.length !== memberIds.length)
      throw new ForbiddenException('Some members are missing!');
    return members;
  }

  // find all package
  async findAll(orgId: number, getServices: GetServicesDto) {
    const queryBuilder = this.serviceRepository
      .createQueryBuilder('service')
      .where('service.orgId = :orgId', { orgId })
      .leftJoinAndSelect('service.category', 'category');
    // If no specific type is provided, return all services
    if (!getServices.type) {
      return queryBuilder.getMany();
    }
    // Add conditions based on the service type
    queryBuilder.andWhere('service.type = :serviceType', {
      serviceType: getServices.type,
    });
    if (getServices.type === ServiceType.package) {
      queryBuilder.leftJoinAndSelect('service.services', 'service_includes');
    }
    return queryBuilder.getMany();
  }

  async createPackage(orgId: number, createPackageDto: CreatePackageDto) {
    const { serviceIds, memberIds, categoryId, ...rest } = createPackageDto;
    // use parallel query for efficient querying
    const [category, members, { price, duration, services }] =
      await Promise.all([
        this.getCategoryById(categoryId, orgId),
        this.getMembersByIds(memberIds, orgId),
        this.calculatePriceAndDuration(serviceIds, orgId),
      ]);
    const serviceNames = services.map((service) => service.name);
    const serviceCount = services.length;
    const discountPrice = this.calculateDiscountPrice(
      price,
      rest.discount,
      rest.discountType,
    );
    const newPackage = this.serviceRepository.create({
      ...rest,
      price,
      category,
      duration,
      discountPrice,
      members,
      serviceCount,
      serviceNames,
      type: ServiceType.package,
      services,
      orgId,
    });
    this.clearCache(orgId);
    return this.serviceRepository.save(newPackage);
  }

  async updatePackage(
    id: string,
    createPackageDto: CreatePackageDto,
    orgId: number,
  ) {
    const { serviceIds, memberIds, categoryId, ...rest } = createPackageDto;
    const myPackage = await this.getPackageById(id, orgId);
    // use parallel query for efficient querying
    const [category, { price, duration, services }, members] =
      await Promise.all([
        this.getCategoryById(categoryId, orgId),
        this.calculatePriceAndDuration(serviceIds, orgId),
        this.getMembersByIds(memberIds, orgId),
      ]);
    // get serviceCount and names array to save in package detail
    const serviceNames = services.map((service) => service.name);
    const serviceCount = services.length;

    const discountPrice = this.calculateDiscountPrice(
      price,
      rest.discount,
      rest.discountType,
    );
    myPackage.services = services;
    myPackage.members = members;
    myPackage.category = category;
    myPackage.price = price;
    myPackage.serviceNames = serviceNames;
    myPackage.serviceCount = serviceCount;
    myPackage.category = category;
    myPackage.duration = duration;
    myPackage.discountPrice = discountPrice;
    Object.assign(myPackage, rest);
    this.clearCache(orgId);
    await this.serviceRepository.save(myPackage);
    await updateTagOfObject(orgId, myPackage.thumbnailUrl, rest.thumbnailUrl);
    return { message: 'Update successfully' };
  }

  async getPackageById(packageId: string, orgId: number) {
    const myPackage = await this.serviceRepository.findOne({
      where: { orgId, id: packageId, type: ServiceType.package },
      relations: { members: true, services: true },
    });
    if (!myPackage) throw new NotFoundException('Package not found');
    return myPackage;
  }

  private async calculatePriceAndDuration(serviceIds: string[], orgId: number) {
    const services = await this.serviceRepository.findBy({
      id: In(serviceIds),
      type: ServiceType.service,
      orgId,
    });
    if (serviceIds.length !== services.length)
      throw new NotFoundException(
        'Some missing services or cannot include packages!',
      );
    const price = services.reduce((pv, cv) => pv + cv.price, 0);
    const duration = services.reduce((pv, cv) => pv + cv.duration, 0);
    return { price, duration, services };
  }

  findOne(id: string) {
    return this.serviceRepository.findOne({
      relations: { members: true, services: true, category: true },
      where: { id },
    });
  }

  // update service by id
  async update(id: string, updateServiceDto: UpdateServiceDto, orgId: number) {
    const { memberIds, categoryId, ...rest } = updateServiceDto;
    const service = await this.getServiceById(id, orgId);
    const [members, category] = await Promise.all([
      this.getMembersByIds(memberIds, orgId),
      this.getCategoryById(categoryId, orgId),
    ]);
    const discountPrice = this.calculateDiscountPrice(
      rest.price,
      rest.discount,
      rest.discountType,
    );
    console.log(rest);
    service.category = category;
    service.members = members;
    service.discountPrice = discountPrice;
    Object.assign(service, rest);
    await this.serviceRepository.save(service);
    this.clearCache(orgId);
    await updateTagOfObject(orgId, service.thumbnailUrl, rest.thumbnailUrl);
    return { message: 'Update service successfully' };
  }

  // Remove service by id
  // delete all relations
  async remove(id: string, orgId: number) {
    const service = await this.getServiceById(id, orgId);
    if (!service) throw new NotFoundException('Service not found');
    service.members = [];
    if (service.type === ServiceType.package) {
      service.services = [];
    }
    await this.serviceRepository.save(service);
    await this.serviceRepository.delete({ id });
    this.clearCache(orgId);
    await deleteObjectAWS(orgId, service.thumbnailUrl);
    return {
      message: 'Deleted service successfully',
    };
  }

  // get services by id
  async getServiceById(serviceId: string, orgId: number): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: {
        orgId,
        id: serviceId,
      },
      relations: { members: true, category: true },
    });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }
}
