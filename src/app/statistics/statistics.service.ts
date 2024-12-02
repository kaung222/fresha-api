import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Service } from '../services/entities/service.entity';
import { GetStatisticsDto } from './dto/get-statistics.dto';
import { Appointment } from '../appointments/entities/appointment.entity';
import { getDatesBetweenDates } from '@/utils';
import { BookingItem } from '../appointments/entities/booking-item.entity';

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
      .getRepository(BookingItem)
      .createQueryBuilder('item')
      .leftJoin('item.appointment', 'appointment')
      .where('item.memberId=:memberId', { memberId })
      .andWhere('item.date IN (:...dates)', { dates })
      .andWhere('appointment.status=:status', { status });

    const BookingItems = await queryBuilder
      .addSelect('appointment.status')
      .getMany();
    const data = await queryBuilder
      .select('SUM(item.duration)', 'totalDuration')
      .addSelect('SUM(item.commissionFees)', 'totalCommissionFees')
      .addSelect('SUM(item.discountPrice)', 'totalDiscountPrice')
      .addSelect('COUNT(*)', 'totalServiceCount')
      .getRawOne();

    return { BookingItems, data };
  }

  async getMemberChart(memberId: number, getStatisticsDto: GetStatisticsDto) {
    const { startDate, endDate, status } = getStatisticsDto;
    const dates = getDatesBetweenDates(startDate, endDate);
    const queryBuilder = this.dataSource
      .getRepository(BookingItem)
      .createQueryBuilder('item')
      .leftJoin('item.appointment', 'appointment')
      .where('item.memberId=:memberId', { memberId })
      .andWhere('item.date IN (:...dates)', { dates })
      .andWhere('appointment.status=:status', { status });

    const data = await queryBuilder
      .select('appointment.date', 'date')
      .addSelect('SUM(item.discountPrice)', 'discountPrice')
      .groupBy('date')
      .orderBy('date')
      .getRawMany();
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
