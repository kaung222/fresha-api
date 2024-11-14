import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ServiceAppointment } from '../appointments/entities/serviceappointment.entity';
import { Service } from '../services/entities/service.entity';

@Injectable()
export class StatisticsService {
  constructor(private dataSource: DataSource) {}
  getMember(orgId: number) {
    const member = this.dataSource
      .getRepository(ServiceAppointment)
      .createQueryBuilder('bookingItem')
      .addSelect('bookingItem.appointment')
      .getRawMany();
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
