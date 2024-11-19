import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { DataSource, In, Repository } from 'typeorm';
import { PaginationResponse } from '@/utils/paginate-res.dto';
import { User } from '../users/entities/user.entity';
import { PaginateQuery } from '@/utils/paginate-query.dto';

@Injectable()
export class ClientsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}
  // create new clinet of organization
  @OnEvent('appointment.created')
  async create(orgId: number, createClientDto: CreateClientDto) {
    const createClient = this.clientRepository.create({
      ...createClientDto,
      organization: { id: orgId },
    });
    const client = await this.clientRepository.save(createClient);
    return {
      message: 'Create client successfully',
      data: client,
    };
  }

  async findAll(orgId: number, paginateQuery: PaginateQuery) {
    const { page = 1, search } = paginateQuery;
    const queryBuilder = this.clientRepository
      .createQueryBuilder('client')
      .where('client.organization=:orgId', { orgId })
      .take(10)
      .skip(10 * (page - 1));
    if (search)
      queryBuilder.andWhere(
        'client.firstName LIKE :search OR client.email=:search',
        { search },
      );
    const [data, totalCount] = await queryBuilder.getManyAndCount();
    return new PaginationResponse({ data, totalCount, page }).toResponse();
  }

  findOne(id: number) {
    return this.clientRepository.findOne({ where: { id }, relations: {} });
  }

  update(id: number, updateClientDto: UpdateClientDto) {
    return this.clientRepository.update(id, updateClientDto);
  }

  remove(id: number) {
    return this.clientRepository.delete(id);
  }

  @OnEvent('appointment.created')
  async createClient({ userId, orgId }: { userId: number; orgId: number }) {
    const client = await this.clientRepository.findOneBy({
      userId,
      organization: { id: orgId },
    });
    if (client) return;
    const user = await this.dataSource
      .getRepository(User)
      .findOneBy({ id: userId });
    const newClient = this.clientRepository.create(user);
    this.clientRepository.save(newClient);
  }

  async checkOwnership(id: number, orgId: number): Promise<Client> {
    const client = await this.clientRepository.findOneBy({
      id,
      organization: { id: orgId },
    });
    if (!client) throw new NotFoundException('client not found');
    return client;
  }
}
