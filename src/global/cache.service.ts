import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

export enum CacheTTL {
  short = 10,
  normal = 20,
  long = 30,
  veryLong = 60,
}

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get(key: string) {
    const dataInCache: string = await this.cache.get(key);
    if (dataInCache) return JSON.parse(dataInCache);
    return null;
  }
  //  ttl unit ==> second
  async set(key: string, value: any, ttl = CacheTTL.normal) {
    return await this.cache.set(key, JSON.stringify(value), ttl * 1000);
  }

  async del(key: string) {
    return await this.cache.del(key);
  }
}
