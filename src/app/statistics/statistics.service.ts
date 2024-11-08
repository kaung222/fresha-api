import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ServiceAppointment } from '../appointments/entities/serviceappointment.entity';

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
}
