import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { PaginateQuery } from '@/utils/paginate-query.dto';
import { PaginationResponse } from '@/utils/paginate-res.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}
  create(orgId: number, createPaymentDto: CreatePaymentDto) {
    const createPayment = this.paymentRepository.create({
      organization: { id: orgId },
      ...createPaymentDto,
    });
    return this.paymentRepository.save(createPayment);
  }

  async findAll(orgId: number, { page = 1 }: PaginateQuery) {
    const [data, totalCount] = await this.paymentRepository.findAndCount({
      where: { organization: { id: orgId } },
      relations: { member: true },
      skip: 10 * (page - 1),
      take: 10,
    });
    return new PaginationResponse({ data, totalCount, page }).toResponse();
  }

  findOne(id: string) {
    return this.paymentRepository.findOne({
      where: { id },
      relations: { member: true },
    });
  }

  update(id: string, updatePaymentDto: UpdatePaymentDto) {
    this.paymentRepository.update(id, updatePaymentDto);
    return {
      message: 'Update payment successfully',
    };
  }

  async checkOwnership(paymentId: string, orgId: number) {
    return await this.paymentRepository.findOneByOrFail({
      organization: { id: orgId },
      id: paymentId,
    });
  }
}
