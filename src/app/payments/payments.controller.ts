import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Roles, User } from '@/security/user.decorator';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@/security/role.decorator';
import { PaginateQuery } from '@/utils/paginate-query.dto';

@Controller('payments')
@ApiTags('Payment')
@Role(Roles.org)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(
    @User('orgId') orgId: number,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    // return this.paymentsService.create(orgId, createPaymentDto);
  }

  @Get()
  findAll(@User('orgId') orgId: number, @Query() paginateQuery: PaginateQuery) {
    return this.paymentsService.findAll(orgId, paginateQuery);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @User('orgId') orgId: number) {
    return this.paymentsService.findOne(id, orgId);
  }
}