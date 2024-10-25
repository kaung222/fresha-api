import { Injectable } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { DataSource, Repository } from 'typeorm';
import { Service } from '../services/entities/service.entity';
import { Member } from '../members/entities/member.entity';
import { PaginationResponse } from '@/utils/paginate-res.dto';
import { PaginateQuery } from '@/utils/paginate-query.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private orgRepository: Repository<Organization>,
    private dataSource: DataSource,
  ) {}

  // create new org
  create(createOrganizationDto: CreateOrganizationDto) {
    const createOrganization = this.orgRepository.create(createOrganizationDto);
    return this.orgRepository.save(createOrganization);
  }

  async findAll(paginateQuery: PaginateQuery) {
    const { page } = paginateQuery;
    const [data, totalCount] = await this.orgRepository.findAndCount();
    return new PaginationResponse({ data, totalCount, page }).toResponse();
  }

  async findServices(orgId: number) {
    const response = await this.dataSource
      .getRepository(Service)
      .createQueryBuilder()
      .where('id=:id', { id: orgId })
      .leftJoinAndSelect('category', 'category')
      .groupBy('category')
      .getRawMany();
    return response;
  }

  async findMember(orgId: number) {
    let page = 1;
    const members = await this.dataSource
      .getRepository(Member)
      .createQueryBuilder()
      .where('organization.id=:orgId', { orgId })
      .leftJoinAndSelect('services', 'services')
      .take(10)
      .skip(10 * (page - 1))
      .getMany();
    return members;
  }

  findOne(id: number) {
    return this.orgRepository.findOneBy({ id });
  }

  update(id: number, updateOrganizationDto: UpdateOrganizationDto) {
    return `This action updates a #${id} organization`;
  }

  remove(id: number) {
    return this.orgRepository.delete(id);
  }
}
