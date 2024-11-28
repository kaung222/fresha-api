import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Roles, User } from '@/security/user.decorator';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@/security/role.decorator';
import { PaginateQuery } from '@/utils/paginate-query.dto';

@Controller('payments')
@ApiTags('Payment')
@Role(Roles.org)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  findAll(@User('orgId') orgId: number, @Query() paginateQuery: PaginateQuery) {
    return this.paymentsService.findAll(orgId, paginateQuery);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @User('orgId') orgId: number) {
    return this.paymentsService.findOne(id, orgId);
  }
}
