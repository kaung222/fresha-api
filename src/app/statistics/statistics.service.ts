import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Service } from '../services/entities/service.entity';

@Injectable()
export class StatisticsService {
  constructor(private dataSource: DataSource) {}
  getMember(orgId: number) {
    return 'hello';
  }

  getMostBookingServices(orgId: number) {
    const service = this.dataSource
      .getRepository(Service)
      .createQueryBuilder('service')
      .where('service.organization=:orgId', { orgId })
      .select('COUNT()')
      .getRawMany();
  }
}
