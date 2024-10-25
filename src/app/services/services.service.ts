import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { DataSource, In, Repository } from 'typeorm';
import { Member } from '../members/entities/member.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    private readonly dataSource: DataSource,
  ) {}
  async create(createServiceDto: CreateServiceDto, orgId: number) {
    const { memberIds, ...rest } = createServiceDto;
    const members = await this.dataSource
      .getRepository(Member)
      .findBy({ id: In(memberIds) });
    const newService = this.serviceRepository.create({
      ...rest,
      members,
      organization: { id: orgId },
    });
    return await this.serviceRepository.save(newService);
  }

  findAll(orgId: number) {
    return this.serviceRepository.findBy({ organization: { id: orgId } });
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

  async update(id: number, updateServiceDto: UpdateServiceDto) {
    const { memberIds, ...rest } = updateServiceDto;

    const service = await this.serviceRepository.findOne({
      relations: { members: true },
      where: { id },
    });
    const members = await this.dataSource
      .getRepository(Member)
      .findBy({ id: In(memberIds) });

    service.members = members;
    Object.assign(service, rest);
    return await this.serviceRepository.save(service);
  }

  remove(id: number) {
    this.serviceRepository.delete(id);
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
