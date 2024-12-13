import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmailDto } from './dto/crearte-email.dto';
import { Email } from './entities/email.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { PaginationResponse } from '@/utils/paginate-res.dto';
import { PaginateQuery } from '@/utils/paginate-query.dto';
import { CacheService, CacheTTL } from '@/global/cache.service';

@Injectable()
export class EmailsService {
  constructor(
    @InjectRepository(Email)
    private readonly emailRepository: Repository<Email>,
    @InjectQueue('emailQueue')
    private readonly emailQueue: Queue,
    private cacheService: CacheService,
  ) {}

  async create(orgId: number, createEmailDto: CreateEmailDto) {
    const email = this.emailRepository.create({ orgId, ...createEmailDto });
    await this.emailQueue.add('sendEmail', email);
    await this.cacheService.del(this.getCacheKey(orgId));
    return { message: 'Send message successfully' };
  }

  async createWithoutSave(createEmailDto: CreateEmailDto) {
    // directly send email
    this.emailQueue.add('sendEmailWithoutSaving', createEmailDto);
  }

  async findAll(orgId: number, paginateQuery: PaginateQuery) {
    const { page = 1 } = paginateQuery;
    const cacheKey = this.getCacheKey(orgId, page);
    const dataInCache = await this.cacheService.get(cacheKey);
    if (dataInCache) return dataInCache;
    const [data, totalCount] = await this.emailRepository.findAndCount({
      where: { orgId },
      take: 20,
      skip: 20 * (page - 1),
    });

    const response = new PaginationResponse({
      page,
      data,
      totalCount,
      pageLimit: 20,
    });
    await this.cacheService.set(cacheKey, response);
    return response;
  }
  private getCacheKey(orgId: number, page = 1) {
    return `clients:${orgId}:${page}`;
  }

  async remove(id: string, orgId: number) {
    const response = await this.emailRepository.delete({ id, orgId });
    if (response.affected !== 1) throw new NotFoundException('Email not found');
    await this.cacheService.del(this.getCacheKey(orgId));
    return {
      message: 'Delete email successfully',
    };
  }
}
