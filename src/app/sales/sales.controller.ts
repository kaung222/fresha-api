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
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Role } from '@/security/role.decorator';
import { Roles, User } from '@/security/user.decorator';
import { CreateQuickSaleDto } from './dto/create-quick-sale.dto';
import { PaginateQuery } from '@/utils/paginate-query.dto';

@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Role(Roles.user)
  create(@User('id') userId: number, @Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(userId, createSaleDto);
  }

  @Post('quick-sale')
  @Role(Roles.org)
  createQuickSale(
    @User('orgId') orgId: number,
    @Body() quickSaleDto: CreateQuickSaleDto,
  ) {
    return this.salesService.createQuickSale(orgId, quickSaleDto);
  }

  @Get()
  @Role(Roles.org)
  findAll(@User('orgId') orgId: number, @Query() paginateQuery: PaginateQuery) {
    return this.salesService.findAll(orgId, paginateQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @User('orgId') orgId: number) {
    return this.salesService.findOne(+id, orgId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSaleDto: UpdateSaleDto,
    @User('orgId') orgId: number,
  ) {
    await this.salesService.checkOwnership(+id, orgId);
    return this.salesService.update(+id, updateSaleDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @User('orgId') orgId: number) {
    await this.salesService.checkOwnership(+id, orgId);
    return this.salesService.remove(+id);
  }
}
