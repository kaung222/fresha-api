import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { DataSource, In, Repository } from 'typeorm';
import { PaginationResponse } from '@/utils/paginate-res.dto';
import { User } from '../users/entities/user.entity';
import { PaginateQuery } from '@/utils/paginate-query.dto';
import { CacheService, CacheTTL } from '@/global/cache.service';

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    private readonly cacheService: CacheService,
  ) {}
  // create new clinet of organization
  async create(orgId: number, createClientDto: CreateClientDto) {
    const createClient = this.clientRepository.create({
      ...createClientDto,
      orgId,
    });
    await this.clientRepository.save(createClient);
    this.cacheService.del(this.getCacheKey(orgId));
    return {
      message: 'Create client successfully',
    };
  }

  async findAll(orgId: number, paginateQuery: PaginateQuery) {
    const { page = 1 } = paginateQuery;
    const cacheKey = this.getCacheKey(orgId, page);
    const dataInCache = await this.cacheService.get(cacheKey);
    if (dataInCache) return dataInCache;
    const [data, totalCount] = await this.clientRepository.findAndCount({
      where: { orgId },
      take: 20,
      skip: 20 * (page - 1),
      order: { createdAt: 'desc' },
    });
    const response = new PaginationResponse({
      data,
      totalCount,
      page,
      pageLimit: 20,
    }).toResponse();
    await this.cacheService.set(cacheKey, response, CacheTTL.veryLong);
    return response;
  }

  private getCacheKey(orgId: number, page = 1) {
    return `clients:${orgId}:${page}`;
  }

  findOne(id: number) {
    return this.clientRepository.findOne({ where: { id }, relations: {} });
  }

  async update(id: number, updateClientDto: UpdateClientDto, orgId: number) {
    await this.getClientById(id, orgId);
    const response = await this.clientRepository.update(id, updateClientDto);
    if (response.affected == 1) {
      this.cacheService.del(this.getCacheKey(orgId, 1));
      return { message: 'Update successfully' };
    }
    throw new ForbiddenException('Error updating client');
  }

  async remove(id: number, orgId: number) {
    await this.getClientById(id, orgId);
    return this.clientRepository.delete({ id });
  }

  async getClientById(id: number, orgId: number): Promise<Client> {
    const client = await this.clientRepository.findOneBy({
      id,
      orgId,
    });
    if (!client) throw new NotFoundException('client not found');
    return client;
  }
}
