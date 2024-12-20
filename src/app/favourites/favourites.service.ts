import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateFavouriteDto } from './dto/create-favourite.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Favourite } from './entities/favourite.entity';
import { Repository } from 'typeorm';
import { PaginateQuery } from '@/utils/paginate-query.dto';
import { PaginationResponse } from '@/utils/paginate-res.dto';
import { CacheService, CacheTTL } from '@/global/cache.service';

@Injectable()
export class FavouritesService {
  constructor(
    @InjectRepository(Favourite)
    private readonly favouriteRepository: Repository<Favourite>,
    private readonly cacheService: CacheService,
  ) {}
  create(userId: string, createFavouriteDto: CreateFavouriteDto) {
    const createFavourite = this.favouriteRepository.create({
      ...createFavouriteDto,
      userId,
    });
    return this.favouriteRepository.save(createFavourite);
  }

  async findAll(userId: string, paginateQuery: PaginateQuery) {
    const { page = 1 } = paginateQuery;
    const cacheKey = this.getCacheKey(userId, page);
    const dataInCache = await this.cacheService.get(cacheKey);
    if (dataInCache) return dataInCache;
    const [data, totalCount] = await this.favouriteRepository.findAndCount({
      where: { userId },
      relations: { organization: true },
      skip: 10 * (page - 1),
      take: 10,
      order: { id: 'DESC' },
    });
    const response = new PaginationResponse({
      data,
      totalCount,
      page,
    }).toResponse();
    await this.cacheService.set(cacheKey, response, CacheTTL.veryLong);
    return response;
  }

  getCacheKey(userId: string, page = 1) {
    return `favourite:${userId}:${page}`;
  }

  async remove(orgId: number, userId: string) {
    const response = await this.favouriteRepository.delete({ orgId, userId });
    if (response.affected == 1) {
      this.cacheService.del(this.getCacheKey(userId));
      return { message: 'Remove from favorite successfully' };
    }
    throw new ForbiddenException('Error removing favaurite');
  }
}
