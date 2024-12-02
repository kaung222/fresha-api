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

  getMostBookingServices(orgId: number, getStatisticsDto: GetStatisticsDto) {
    const { startDate, endDate, status } = getStatisticsDto;
    const dates = getDatesBetweenDates(startDate, endDate);
    const services = this.dataSource
      .getRepository(BookingItem)
      .createQueryBuilder('item')
      .leftJoin('item.appointment', 'appointment')
      .where('appointment.orgId=:orgId', { orgId })
      .andWhere('item.date IN (:...dates)', { dates })
      .select('item.serviceId', 'serviceId')
      // .addSelect('item.serviceName', 'serviceName')
      .addSelect('COUNT(item.id)', 'totalOrders')
      .groupBy('serviceId')
      .getRawMany();
    return services;
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
      .andWhere('appointment.date IN (:...dates)', { dates })
      .select('appointment.date', 'date')
      // .select('SUM(appointment.duration)', 'totalDuration')
      .addSelect('SUM(appointment.totalCommissionFees)', 'totalCommissionFees')
      .addSelect('SUM(appointment.discountPrice)', 'totalDiscountPrice')
      .addSelect('COUNT(*)', 'totalAppointments')
      // .addSelect('SUM(appointment.tips)', 'totalTips')
      .groupBy('date')
      .getRawMany();
    return data;
  }

  async getMVPOfMonth(orgId: number, getStatisticsDto: GetStatisticsDto) {
    const { startDate, endDate } = getStatisticsDto;
    const dates = getDatesBetweenDates(startDate, endDate);
    const services = this.dataSource
      .getRepository(BookingItem)
      .createQueryBuilder('item')
      .leftJoin('item.appointment', 'appointment')
      .where('appointment.orgId=:orgId', { orgId })
      .andWhere('item.date IN (:...dates)', { dates })
      .select('item.memberId', 'memberId')
      .addSelect('COUNT(item.id)', 'totalOrders')
      .addSelect('SUM(item.commissionFees)', 'totalFees')
      .addSelect('SUM(item.duration)', 'totalDuration')
      .groupBy('memberId')
      .getRawMany();
    return services;
  }
}
