import { Injectable } from '@nestjs/common';
import { DataSource, Like } from 'typeorm';
import { SearchDto } from './search.controller';
import { Product } from '../products/entities/product.entity';
import { PaginationResponse } from '@/utils/paginate-res.dto';
import { Service } from '../services/entities/service.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Sale } from '../sales/entities/sale.entity';
import { Client } from '../clients/entities/client.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { OrgSearchDto } from './dto/org-search.dto';

@Injectable()
export class SearchService {
  constructor(private readonly dataSource: DataSource) {}

  async search(orgId: number, searchDto: SearchDto) {
    const { q, name, page } = searchDto;
    switch (name) {
      case 'product':
        return await this.searchProducts(q, page, orgId);

      case 'service':
        return await this.searchService(q, page, orgId);

      case 'appointment':
        return await this.searchAppointment(q, page, orgId);

      case 'sale':
        return await this.searchSale(q, page, orgId);

      default:
        return await this.searchClient(q, page, orgId);
    }
  }

  private async searchSale(q: string, page = 1, orgId: number) {
    const [data, totalCount] = await this.dataSource
      .getRepository(Sale)
      .findAndCount({
        where: [
          { username: Like(`%${q}%`), orgId },
          { email: q, orgId },
          { notes: Like(`%${q}%`), orgId },
          { phone: q, orgId },
        ],
        take: 10,
        skip: 10 * (page - 1),
      });
    return new PaginationResponse({ data, totalCount, page }).toResponse();
  }

  private async searchClient(q: string, page = 1, orgId: number) {
    const [data, totalCount] = await this.dataSource
      .getRepository(Client)
      .findAndCount({
        where: [
          { firstName: Like(`%${q}%`), orgId },
          { lastName: Like(`%${q}%`), orgId },
          { email: q, orgId },
          { phone: q, orgId },
        ],
        take: 10,
        skip: 10 * (page - 1),
      });
    return new PaginationResponse({ data, totalCount, page }).toResponse();
  }

  private async searchProducts(q: string, page = 1, orgId: number) {
    const [data, totalCount] = await this.dataSource
      .getRepository(Product)
      .findAndCount({
        where: { name: Like(`%${q}%`), orgId },
        take: 10,
        skip: 10 * (page - 1),
      });
    return new PaginationResponse({ data, totalCount, page }).toResponse();
  }

  private async searchService(q: string, page = 1, orgId: number) {
    const [data, totalCount] = await this.dataSource
      .getRepository(Service)
      .findAndCount({
        where: [
          { name: Like(`%${q}%`), orgId },
          { description: Like(`%${q}%`), orgId },
        ],
        take: 10,
        skip: 10 * (page - 1),
      });
    return new PaginationResponse({ data, totalCount, page }).toResponse();
  }

  private async searchAppointment(q: string, page = 1, orgId: number) {
    const [data, totalCount] = await this.dataSource
      .getRepository(Appointment)
      .findAndCount({
        where: [
          { username: Like(`%${q}%`), orgId },
          { email: q, orgId },
          { phone: q, orgId },
          { notes: Like(`%${q}%`), orgId },
          { token: q, orgId },
        ],
        take: 10,
        skip: 10 * (page - 1),
      });
    return new PaginationResponse({ data, totalCount, page }).toResponse();
  }

  async searchOrg(orgSearchDto: OrgSearchDto) {
    const { search = '', types, lat, long } = orgSearchDto;
    const queryBuilder = this.dataSource
      .getRepository(Organization)
      .createQueryBuilder('org')
      .where('org.name LIKE :search', { search: `%${search}%` })
      .andWhere('org.isPublished = :isPublished', { isPublished: true })
      .take(10);

    if (lat && long) {
      queryBuilder
        .addSelect(
          `
          (6371 * acos(
            cos(radians(:lat)) * cos(radians(org.latitude)) *
            cos(radians(org.longitude) - radians(:long)) +
            sin(radians(:lat)) * sin(radians(org.latitude))
          ))`,
          'distance',
        ) // Calculate distance in kilometers
        .having('distance <= :radius', { radius: 10 })
        .setParameters({ lat, long })
        .orderBy('distance', 'ASC'); // Sort by nearest
    }
    if (types) {
      queryBuilder.andWhere('JSON_CONTAINS(org.types, JSON_ARRAY(:types))', {
        types,
      });
    }

    const result = await queryBuilder.getMany();
    return result;
  }

  async searchServices(search = '', page = 1) {
    return await this.dataSource
      .getRepository(Service)
      .createQueryBuilder('service')
      .where('service.name LIKE :search', { search: `%${search}%` })
      .leftJoinAndSelect('service.organization', 'organization')
      .skip(10 * (page - 1))
      .take(10)
      .getMany();
  }
}
