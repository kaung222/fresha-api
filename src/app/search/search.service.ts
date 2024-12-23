import { Injectable } from '@nestjs/common';
import { DataSource, Like } from 'typeorm';
import { SearchDto } from './search.controller';
import { Product } from '../products/entities/product.entity';
import { PaginationResponse } from '@/utils/paginate-res.dto';
import { Service } from '../services/entities/service.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Sale } from '../sales/entities/sale.entity';
import { Client } from '../clients/entities/client.entity';

@Injectable()
export class SearchService {
  constructor(private readonly dataSource: DataSource) {}

  async search(searchDto: SearchDto) {
    const { q, name, page } = searchDto;
    switch (name) {
      case 'product':
        return await this.searchProducts(q, page);

      case 'service':
        return await this.searchService(q, page);

      case 'appointment':
        return await this.searchAppointment(q, page);

      case 'sale':
        return await this.searchSale(q, page);

      default:
        return await this.searchClient(q, page);
    }
  }

  private async searchSale(q: string, page = 1) {
    const [data, totalCount] = await this.dataSource
      .getRepository(Sale)
      .findAndCount({
        where: [
          { username: Like(`%${q}%`) },
          { email: q },
          { notes: Like(`%${q}%`) },
          { phone: q },
        ],
        take: 10,
        skip: 10 * (page - 1),
      });
    return new PaginationResponse({ data, totalCount, page }).toResponse();
  }

  private async searchClient(q: string, page = 1) {
    const [data, totalCount] = await this.dataSource
      .getRepository(Client)
      .findAndCount({
        where: [
          { firstName: Like(`%${q}%`) },
          { lastName: Like(`%${q}%`) },
          { email: q },
          { phone: q },
        ],
        take: 10,
        skip: 10 * (page - 1),
      });
    return new PaginationResponse({ data, totalCount, page }).toResponse();
  }

  private async searchProducts(q: string, page = 1) {
    const [data, totalCount] = await this.dataSource
      .getRepository(Product)
      .findAndCount({
        where: { name: Like(`%${q}%`) },
        take: 10,
        skip: 10 * (page - 1),
      });
    return new PaginationResponse({ data, totalCount, page }).toResponse();
  }

  private async searchService(q: string, page = 1) {
    const [data, totalCount] = await this.dataSource
      .getRepository(Service)
      .findAndCount({
        where: [{ name: Like(`%${q}%`) }, { description: Like(`%${q}%`) }],
        take: 10,
        skip: 10 * (page - 1),
      });
    return new PaginationResponse({ data, totalCount, page }).toResponse();
  }

  private async searchAppointment(q: string, page = 1) {
    const [data, totalCount] = await this.dataSource
      .getRepository(Appointment)
      .findAndCount({
        where: [
          { username: Like(`%${q}%`) },
          { email: q },
          { phone: q },
          { notes: Like(`%${q}%`), token: parseInt(q) },
        ],
        take: 10,
        skip: 10 * (page - 1),
      });
    return new PaginationResponse({ data, totalCount, page }).toResponse();
  }
}
