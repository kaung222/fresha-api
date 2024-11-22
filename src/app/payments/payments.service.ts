import { Injectable } from '@nestjs/common';
import { CreatePaymentBySystem } from './dto/create-payment.dto';
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

  // manual create payment
  // create(orgId: number, createPaymentDto: CreatePaymentDto) {
  //   const createPayment = this.paymentRepository.create({
  //     ...createPaymentDto,
  //     organization: { id: orgId },
  //   });
  //   return this.paymentRepository.save(createPayment);
  // }

  // on appointment complete create a payment base on it
  createPaymentByAppointment(createPaymentDto: CreatePaymentBySystem) {
    const createPayment = this.paymentRepository.create(createPaymentDto);
    this.paymentRepository.save(createPayment);
  }

  // async createPaymentBySales(createPaymentDto: CreatePaymentBySystem) {
  //   const { products, orgId, ...rest } = createPaymentDto;
  //   const createPayment = this.paymentRepository.create({
  //     ...rest,
  //     products,
  //     organization: { id: orgId },
  //   });
  //   return this.paymentRepository.save(createPayment);
  // }

  async findAll(orgId: number, { page = 1 }: PaginateQuery) {
    // return 'hello';
    // const [data, totalCount] = await this.paymentRepository.findAndCount({
    //   where: { organization: { id: orgId } },
    //   relations: { member: true },
    //   skip: 10 * (page - 1),
    //   take: 10,
    // });
    // return new PaginationResponse({ data, totalCount, page }).toResponse();
  }

  findOne(id: string, orgId: number) {
    // return this.paymentRepository.find({ relations: { organization: true } });
    // return this.paymentRepository.findOneOrFail({
    //   where: { id, organization: { id: orgId } },
    //   relations: ['member', 'services', 'products'],
    // });
  }
}
