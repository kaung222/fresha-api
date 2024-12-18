import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { Repository } from 'typeorm';
import { PaginationResponse } from '@/utils/paginate-res.dto';
import { PaginateQuery } from '@/utils/paginate-query.dto';
import { CacheService, CacheTTL } from '@/global/cache.service';
import {
  deleteObjectAWS,
  updateObjectAsUsed,
  updateTagOfObject,
} from '@/utils/store-obj-s3';

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
    await updateObjectAsUsed(createClientDto.profilePicture);
    await this.clientRepository.insert(createClient);
    await this.cacheService.del(this.getCacheKey(orgId));
    // ..
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
    const client = await this.getClientById(id, orgId);
    const response = await this.clientRepository.update(id, updateClientDto);
    this.cacheService.del(this.getCacheKey(orgId, 1));
    updateTagOfObject(
      orgId,
      client?.profilePicture,
      updateClientDto?.profilePicture,
    );
    return { message: 'Update client successfully' };
    throw new ForbiddenException('Error updating client');
  }

  async remove(id: number, orgId: number) {
    const { profilePicture } = await this.getClientById(id, orgId);
    profilePicture && (await deleteObjectAWS(orgId, profilePicture));
    this.cacheService.del(this.getCacheKey(orgId));
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
