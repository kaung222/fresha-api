import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateBookingPaymentBySystem,
  CreateSalePayment,
} from './dto/create-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { DataSource, In, Repository } from 'typeorm';
import { PaginateQuery } from '@/utils/paginate-query.dto';
import { PaginationResponse } from '@/utils/paginate-res.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  // on appointment complete create a payment base on it
  // hello
  async createPaymentByAppointment(
    createPaymentDto: CreateBookingPaymentBySystem,
  ) {
    const payment = await this.paymentRepository.findOneBy({
      appointmentId: createPaymentDto.appointmentId,
    });
    const createPayment = this.paymentRepository.create({
      id: payment?.id,
      ...createPaymentDto,
    });

    this.paymentRepository.save(createPayment);
  }

  createPaymentBySales(createPaymentDto: CreateSalePayment) {
    const createPayment = this.paymentRepository.create(createPaymentDto);
    this.paymentRepository.save(createPayment);
  }

  async findAll(orgId: number, { page = 1 }: PaginateQuery) {
    const [data, totalCount] = await this.paymentRepository.findAndCount({
      where: { orgId },
      skip: 10 * (page - 1),
      take: 10,
    });
    return new PaginationResponse({ data, totalCount, page }).toResponse();
  }

  async findOne(id: string, orgId: number) {
    const payment = await this.paymentRepository.findOne({
      where: { orgId, id },
      relations: { appointment: true, sale: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }
}
