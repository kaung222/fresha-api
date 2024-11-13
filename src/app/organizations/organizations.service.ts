import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { DataSource, In, Repository, TableInheritance } from 'typeorm';
import { Service } from '../services/entities/service.entity';
import { Member } from '../members/entities/member.entity';
import { PaginationResponse } from '@/utils/paginate-res.dto';
import { PaginateQuery } from '@/utils/paginate-query.dto';
import { Category } from '../categories/entities/category.entity';
import { OrgReview } from '../org-reviews/entities/org-review.entity';
import { CreateAppointmentDto } from '../appointments/dto/create-appointment.dto';
import { Appointment } from '../appointments/entities/appointment.entity';
import { ServiceAppointment } from '../appointments/entities/serviceappointment.entity';
import { AddAppointmentDto } from '../clients/dto/create-appointment.dto';
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
    const { page = 1 } = paginateQuery;
    const [data, totalCount] = await this.orgRepository.findAndCount({
      select: ['rating', 'totalReviews', 'name', 'id', 'types'],
    });
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

  async findOne(id: number) {
    const organization = await this.orgRepository.findOneBy({ id });
    const related = await this.orgRepository.find({
      where: { types: In(organization.types) },
      take: 3,
    });
    return {
      organization,
      related,
    };
  }
  async getProfile(orgId: number) {
    const organization = await this.orgRepository
      .createQueryBuilder('organization')
      .where('organization.id=:orgId', { orgId })
      .addSelect('organization.isPublished')
      .addSelect('organization.notes')
      .addSelect('organization.address')
      .getOne();
    return organization;
  }

  findCategories(orgId: number) {
    return this.dataSource.getRepository(Category).find({
      where: { organization: { id: orgId } },
      relations: { services: true },
    });
  }

  findTeam(orgId: number) {
    return this.dataSource.getRepository(Member).find({
      where: { organization: { id: orgId } },
    });
  }

  async findReviews(orgId: number, paginateQuery: PaginateQuery) {
    const { page } = paginateQuery;
    const [data, totalCount] = await this.dataSource
      .getRepository(OrgReview)
      .findAndCount({
        skip: 10 * (page - 1),
        take: 10,
        where: { organization: { id: orgId } },
        order: {
          rating: 'desc',
        },
      });
    return new PaginationResponse({ data, page, totalCount }).toResponse();
  }

  update(id: number, updateOrganizationDto: UpdateOrganizationDto) {
    return this.orgRepository.update(id, updateOrganizationDto);
  }

  getNearOrg(lng: number, lat: number, maxDistance: number) {
    return this.orgRepository.query(
      `SELECT *, ST_Distance_Sphere(location, POINT(?, ?)) AS distance
       FROM shop
       HAVING distance <= ?
       ORDER BY distance
       LIMIT 10;`,
      [lng, lat, maxDistance],
    );
  }

  // @Column({ type: 'point' })
  // location: string;
}
