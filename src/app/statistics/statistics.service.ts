import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Service } from '../services/entities/service.entity';
import { GetStatisticsDto } from './dto/get-statistics.dto';
import { Appointment } from '../appointments/entities/appointment.entity';
import { getDatesBetweenDates } from '@/utils';

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
  async getMemberStatistics(
    memberId: number,
    getStatisticsDto: GetStatisticsDto,
  ) {
    const { startDate, endDate, status } = getStatisticsDto;
    const dates = getDatesBetweenDates(startDate, endDate);
    const queryBuilder = this.dataSource
      .getRepository(Appointment)
      .createQueryBuilder('appointment')
      .where('appointment.memberId=:memberId', { memberId })
      .andWhere('appointment.date IN :dates', { dates })
      .select('SUM(appointment.duration)', 'totalDuration')
      .addSelect('SUM(appointment.commissionFees)', 'totalCommissionFees')
      .addSelect('COUNT(*)', 'totalAppointments')
      .addSelect('SUM(appointment.tips)', 'totalTips');
    // .getRawOne();

    if (status) {
      queryBuilder.andWhere('appointment.status=:status', { status });
    }
    const data = await queryBuilder.getRawOne();
    return data;
  }

  async getOrgAppointmentStatistics(
    orgId: number,
    getStatisticsDto: GetStatisticsDto,
  ) {
    const { startDate, endDate } = getStatisticsDto;
    const dates = getDatesBetweenDates(startDate, endDate);
    const data = await this.dataSource
      .getRepository(Appointment)
      .createQueryBuilder('appointment')
      .where('appointment.orgId=:orgId', { orgId })
      .andWhere('appointment.date IN :dates', { dates })
      .select('SUM(appointment.duration)', 'totalDuration')
      .addSelect('SUM(appointment.commissionFees)', 'totalCommissionFees')
      .addSelect('COUNT(*)', 'totalAppointments')
      .addSelect('SUM(appointment.tips)', 'totalTips')
      .getRawOne();
    return data;
  }

  async getMVPOfMonth(orgId: number, getStatisticsDto: GetStatisticsDto) {
    const { startDate, endDate } = getStatisticsDto;
    const dates = getDatesBetweenDates(startDate, endDate);
    const data = this.dataSource
      .getRepository(Appointment)
      .createQueryBuilder('appointment')
      .where('appointment.orgId=:orgId', { orgId });
  }
}
