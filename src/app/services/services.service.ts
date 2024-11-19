import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { DataSource, In, Not, Repository } from 'typeorm';
import { Member } from '../members/entities/member.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    private readonly dataSource: DataSource,
  ) {}

  // create new service
  async create(createServiceDto: CreateServiceDto, orgId: number) {
    const { memberIds, ...rest } = createServiceDto;
    const members = await this.getMembersByIds(memberIds, orgId);
    const newService = this.serviceRepository.create({
      ...rest,
      members,
      organization: { id: orgId },
    });
    return await this.serviceRepository.save(newService);
  }
  async getMembersByIds(memberIds: number[], orgId: number) {
    const members = await this.dataSource
      .getRepository(Member)
      .findBy({ id: In(memberIds), orgId });
    if (members.length !== memberIds.length)
      throw new ForbiddenException('Some members are missing!');
    return members;
  }
  findAll(orgId: number) {
    return this.serviceRepository.find({
      where: { orgId },
    });
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
