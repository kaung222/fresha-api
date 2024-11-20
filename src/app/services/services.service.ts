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

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    private readonly dataSource: DataSource,
  ) {}

  // create new service
  async create(createServiceDto: CreateServiceDto, orgId: number) {
    const { memberIds, categoryId, ...rest } = createServiceDto;
    const members = await this.getMembersByIds(memberIds, orgId);
    const category = await this.getCategoryById(categoryId, orgId);
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
    return await this.serviceRepository.save(newService);
  }

  calculateDiscountPrice(
    price: number,
    discount: number,
    discountType: DiscountType,
  ) {
    switch (discountType) {
      case DiscountType.free:
        return 0;
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
    const { price, duration, services } = await this.calculatePriceAndDuration(
      serviceIds,
      orgId,
    );
    const members = await this.getMembersByIds(memberIds, orgId);
    const category = await this.getCategoryById(categoryId, orgId);
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
      type: ServiceType.package,
      services,
      orgId,
    });
    return this.serviceRepository.save(newPackage);
  }

  async updatePackage(
    id: number,
    createPackageDto: CreatePackageDto,
    orgId: number,
  ) {
    const { serviceIds, memberIds, ...rest } = createPackageDto;
    const myPackage = await this.getPackageById(id, orgId);
    const { price, duration, services } = await this.calculatePriceAndDuration(
      serviceIds,
      orgId,
    );
    const members = await this.getMembersByIds(memberIds, orgId);
    const discountPrice = this.calculateDiscountPrice(
      price,
      rest.discount,
      rest.discountType,
    );
    (myPackage.services = services), (myPackage.members = members);
    myPackage.price = price;
    myPackage.duration = duration;
    myPackage.discountPrice = discountPrice;
    Object.assign(myPackage, rest);
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
      relations: { members: true },
      where: { id },
    });
  }

  findByIds(ids: number[]) {
    return this.serviceRepository.findBy({ id: In(ids) });
  }

  async update(id: number, updateServiceDto: UpdateServiceDto, orgId: number) {
    const { memberIds, ...rest } = updateServiceDto;
    const members = await this.getMembersByIds(memberIds, orgId);
    const service = await this.serviceRepository.findOne({
      relations: { members: true },
      where: { id },
    });
    service.members = members;
    Object.assign(service, rest);
    return await this.serviceRepository.save(service);
  }

  async remove(id: number) {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: { appointments: true },
    });
    if (!service) throw new NotFoundException('Service not found');
    service.appointments = [];
    service.members = [];
    service.payments = [];
    if (service.type === ServiceType.package) {
      service.services = [];
    }
    await this.serviceRepository.save(service);
    return this.serviceRepository.delete(id);
  }

  async checkOwnership(serviceId: number, orgId: number): Promise<Service> {
    const service = await this.serviceRepository.findOneBy({
      organization: { id: orgId },
      id: serviceId,
    });
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }
}
