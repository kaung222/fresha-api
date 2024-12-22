import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import {
  DataSource,
  In,
  JsonContains,
  Repository,
  TableInheritance,
} from 'typeorm';
import { Service } from '../services/entities/service.entity';
import { Member } from '../members/entities/member.entity';
import { PaginationResponse } from '@/utils/paginate-res.dto';
import { PaginateQuery } from '@/utils/paginate-query.dto';
import { Category } from '../categories/entities/category.entity';
import { OrgReview } from '../org-reviews/entities/org-review.entity';
import { UpdateCurrency } from './dto/update-currency';
import { Product } from '../products/entities/product.entity';
import { OrgSchedule } from '../org-schedule/entities/org-schedule.entity';
import { CacheService, CacheTTL } from '@/global/cache.service';
@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private orgRepository: Repository<Organization>,
    private dataSource: DataSource,
    private readonly cacheService: CacheService,
  ) {}

  // create new org
  create(createOrganizationDto: CreateOrganizationDto) {
    const createOrganization = this.orgRepository.create(createOrganizationDto);
    return this.orgRepository.save(createOrganization);
  }

  async findAll(paginateQuery: PaginateQuery) {
    const { page = 1 } = paginateQuery;
    const [data, totalCount] = await this.orgRepository.findAndCount({
      // where: { isPublished: true },
      order: { rating: 'DESC' },
    });
    return new PaginationResponse({ data, totalCount, page }).toResponse();
  }

  async findServices(orgId: number) {
    return await this.dataSource
      .getRepository(Category)
      .find({ where: { orgId }, relations: { services: true } });
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

  // find detail by public
  async findOne(slug: string) {
    const cacheKey = `org-details:${slug}`;
    const dataInCache = await this.cacheService.get(cacheKey);
    if (dataInCache) return dataInCache;
    const organization = await this.orgRepository.findOneBy({
      slug,
      // isPublished: true,
    });
    if (!organization) throw new NotFoundException('Organization not found');
    // to select related org
    const organizationType = organization.types[0];
    const [related, members, schedules, services] = await Promise.all([
      this.orgRepository
        .createQueryBuilder('org')
        .where('JSON_CONTAINS(org.types, :type)', {
          type: `"${organizationType}"`,
        })
        .andWhere('org.id!=:id AND isPublished=true', { id: organization.id })

        .getOne(),
      this.findTeam(organization.id),
      this.findSchedule(organization.id),
      this.findServices(organization.id),
    ]);
    // const isLiked = await this.dataSource.getRepository(Favourite).findOneBy({
    //   where: { post: { id: postId }, userId: requesterId },
    // });
    const response = {
      organization,
      related,
      services,
      members,
      schedules,
      // isFav: !!isLiked,
    };
    await this.cacheService.set(cacheKey, response, CacheTTL.veryLong);
    return response;
  }

  async findSchedule(orgId: number) {
    return await this.dataSource.getRepository(OrgSchedule).findBy({ orgId });
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

  // find categories by public
  findCategories(orgId: number) {
    return this.dataSource.getRepository(Category).find({
      where: { orgId },
      relations: { services: true },
    });
  }

  // find member by public
  async findTeam(orgId: number) {
    return await this.dataSource.getRepository(Member).findBy({ orgId });
  }

  // find member by public
  findProducts(orgId: number) {
    return this.dataSource.getRepository(Product).findBy({ orgId });
  }

  async findReviews(orgId: number, paginateQuery: PaginateQuery) {
    const { page, search } = paginateQuery;
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

  async updateCurrencyDto(id: number, updateCurrencyDto: UpdateCurrency) {
    const updateRes = await this.orgRepository.update(id, {
      currency: updateCurrencyDto.currency,
    });
    if (updateRes.affected === 1)
      return { message: 'Change currency successfully' };
    throw new ForbiddenException();
  }

  async getNearBy(lat: number, lng: number, radius: number) {
    const earthRadiusKm = 6371; // Radius of the Earth in kilometers
    const query = `
      SELECT *, 
        (${earthRadiusKm} * ACOS(
          COS(RADIANS(?)) * COS(RADIANS(latitude)) * COS(RADIANS(longitude) - RADIANS(?)) 
          + SIN(RADIANS(?)) * SIN(RADIANS(latitude))
        )) AS distance
      FROM organization
      HAVING distance <= ?
      ORDER BY distance
      LIMIT 10;
    `;

    const results = await this.orgRepository.query(query, [
      lat,
      lng,
      lat,
      radius,
    ]);
    return results;
  }
}
