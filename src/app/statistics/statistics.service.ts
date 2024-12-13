import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Service } from '../services/entities/service.entity';
import { GetStatisticsDto } from './dto/get-statistics.dto';
import { Appointment } from '../appointments/entities/appointment.entity';
import { getDatesBetweenDates } from '@/utils';
import { BookingItem } from '../appointments/entities/booking-item.entity';
import { SaleItem } from '../sales/entities/sale-item.entity';

@Injectable()
export class StatisticsService {
  constructor(private dataSource: DataSource) {}
  getMember(orgId: number) {
    return 'hello';
  }

  getMostBookingServices(orgId: number, getStatisticsDto: GetStatisticsDto) {
    const { startDate, endDate, status } = getStatisticsDto;

    const services = this.dataSource
      .getRepository(BookingItem)
      .createQueryBuilder('item')
      .leftJoin('item.appointment', 'appointment')
      .where('appointment.orgId=:orgId', { orgId })
      .andWhere('appointment.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .select('item.serviceId', 'serviceId')
      // .addSelect('item.serviceName', 'serviceName')
      .addSelect('COUNT(item.id)', 'totalOrders')
      .groupBy('serviceId')
      .getRawMany();
    return services;
  }

  async getMemberStatistics(
    memberId: string,
    getStatisticsDto: GetStatisticsDto,
  ) {
    const { startDate, endDate, status } = getStatisticsDto;
    const bookingItems = await this.dataSource
      .getRepository(BookingItem)
      .createQueryBuilder('item')
      .leftJoin('item.appointment', 'appointment')
      .where('item.memberId=:memberId', { memberId })
      .andWhere('appointment.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('appointment.status=:status', { status })
      .addSelect('appointment.status')
      .addSelect('appointment.createdAt')
      .getMany();

    const data = {
      totalDuration: bookingItems.reduce((pv, cv) => pv + cv.duration, 0),
      totalCommissionFees: bookingItems.reduce(
        (pv, cv) => pv + cv.commissionFees,
        0,
      ),
      totalDiscountPrice: bookingItems.reduce(
        (pv, cv) => pv + cv.discountPrice,
        0,
      ),
      totalServiceCount: bookingItems.length,
    };
    return { bookingItems, data };
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
      .andWhere('appointment.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .select('item.memberId', 'memberId')
      .addSelect('COUNT(item.id)', 'totalOrders')
      .addSelect('SUM(item.commissionFees)', 'totalFees')
      .addSelect('SUM(item.duration)', 'totalDuration')
      .groupBy('memberId')
      .getRawMany();
    return services;
  }

  async getProductStatistics(
    productId: string,
    getStatistics: GetStatisticsDto,
  ) {
    const { startDate, endDate, status } = getStatistics;
    const saleItems = await this.dataSource
      .getRepository(SaleItem)
      .createQueryBuilder('item')
      .leftJoin('item.sale', 'sale')
      .where('item.productId = :productId', { productId })
      .andWhere('sale.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('sale.status=:status', { status })
      .addSelect('sale.createdAt')
      .getMany();
    const data = {
      totalQuantity: saleItems.reduce((pv, cv) => pv + cv.quantity, 0),
      totalPrice: saleItems.reduce((pv, cv) => pv + cv.subtotalPrice, 0),
    };

    return { saleItems, data };
  }

  // async getServiceStatistics(
  //   serviceId: string,
  //   getStatistics: GetStatisticsDto,
  // ) {
  //   const { startDate, endDate, status } = getStatistics;
  //   const queryBuilder = this.dataSource
  //     .getRepository(BookingItem)
  //     .createQueryBuilder('item')
  //     .leftJoin('item.appointment', 'appointment')
  //     .where('item.serviceId = :serviceId', { serviceId })
  //     .andWhere('appointment.createdAt BETWEEN :startDate AND :endDate', {
  //       startDate,
  //       endDate,
  //     })
  //     .select("DATE_FORMAT(appointment.createdAt,'%Y-%m-%d')", 'date')
  //     .addSelect('item.price', 'price')
  //     .addSelect('COUNT(item.id)', 'totalCount')
  //     .addSelect('SUM(item.price)', 'totalPrice')
  //     .groupBy('date')
  //     .addGroupBy('price')
  //     .orderBy('date');

  //   return await queryBuilder.getRawMany();
  // }

  async getServiceStatistics(
    serviceId: string,
    getStatisticsDto: GetStatisticsDto,
  ) {
    const { startDate, endDate, status } = getStatisticsDto;
    const bookingItems = await this.dataSource
      .getRepository(BookingItem)
      .createQueryBuilder('item')
      .leftJoin('item.appointment', 'appointment')
      .where('item.serviceId=:serviceId', { serviceId })
      .andWhere('appointment.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('appointment.status=:status', { status })
      .addSelect('appointment.status')
      .addSelect('appointment.createdAt')
      .getMany();

    const data = {
      totalCommissionFees: bookingItems.reduce(
        (pv, cv) => pv + cv.commissionFees,
        0,
      ),
      totalDuration: bookingItems.reduce((pv, cv) => pv + cv.duration, 0),
      totalDiscountPrice: bookingItems.reduce(
        (pv, cv) => pv + cv.discountPrice,
        0,
      ),
      totalServiceCount: bookingItems.length,
    };

    // await queryBuilder
    //   .select('SUM(item.duration)', 'totalDuration')
    //   .addSelect('SUM(item.commissionFees)', 'totalDuration')
    //   .addSelect('SUM(item.discountPrice)', 'totalDiscountPrice')
    //   .addSelect('COUNT(*)', 'totalServiceCount')
    //   .getRawOne();

    return { data, bookingItems };
  }
}
