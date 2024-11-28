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
import { CategoriesService } from '../categories/categories.service';
import { CacheService } from '@/global/cache.service';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    private readonly dataSource: DataSource,
    private cacheService: CacheService,
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
    return await this.serviceRepository.save(newService);
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
    id: number,
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
    return this.serviceRepository.save(myPackage);
  }

  async getPackageById(packageId: number, orgId: number) {
    const myPackage = await this.serviceRepository.findOne({
      where: { orgId, id: packageId, type: ServiceType.package },
      relations: { members: true, services: true },
    });
    if (!myPackage) throw new NotFoundException('Package not found');
    return myPackage;
  }

  async calculatePriceAndDuration(serviceIds: number[], orgId: number) {
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

  findOne(id: number) {
    return this.serviceRepository.findOne({
      relations: { members: true, services: true, category: true },
      where: { id },
    });
  }

  // update service by id
  async update(id: number, updateServiceDto: UpdateServiceDto, orgId: number) {
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
    this.clearCache(orgId);
    return await this.serviceRepository.save(service);
  }

  // Remove service by id
  // delete all relations
  async remove(id: number, orgId: number) {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: { appointments: true },
    });
    if (!service) throw new NotFoundException('Service not found');
    service.appointments = [];
    service.members = [];
    if (service.type === ServiceType.package) {
      service.services = [];
    }
    await this.serviceRepository.save(service);
    await this.serviceRepository.delete({ id });
    this.clearCache(orgId);
    return {
      message: 'Deleted service successfully',
    };
  }

  // get services by id
  async getServiceById(serviceId: number, orgId: number): Promise<Service> {
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
