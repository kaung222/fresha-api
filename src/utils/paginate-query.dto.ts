import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { FindOptionsWhere, Repository } from 'typeorm';

export class PaginateQuery {
  search?: string;
  @Transform(({ value }) => parseInt(value))
  page?: number;
  @Transform(({ value }) => parseInt(value))
  pageLimit?: number;
}

export async function findAll<T>(
  repository: Repository<T>, // Accepts a repository of any entity
  filters: {
    relations?: string[];
    where?: FindOptionsWhere<T>;
    take?: number;
    skip?: number;
  },
  cacheKey: string,
): Promise<T[]> {
  // Check cache
  const cachedData = await this.cacheService.get(cacheKey);
  if (cachedData) return cachedData;

  // Query the repository
  const data = await repository.find({
    relations: filters.relations,
    where: filters.where,
    take: filters.take || 10, // Default to 10 items per page
    skip: filters.skip || 0, // Default to no offset
  });

  // Cache the results (optional: add TTL if needed)
  await this.cacheService.set(cacheKey, data);

  return data;
}
