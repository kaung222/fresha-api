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
import { Role } from '@/security/role.decorator';
import { Roles, User } from '@/security/user.decorator';
import { CreateQuickSaleDto } from './dto/create-quick-sale.dto';
import { PaginateQuery } from '@/utils/paginate-query.dto';
import { UpdateQuickSaleDto } from './dto/update-sale.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('sales')
@ApiTags('Sale')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Post()
  @Role(Roles.org)
  create(@User('orgId') orgId: number, @Body() createSaleDto: CreateSaleDto) {
    return this.salesService.create(orgId, createSaleDto);
  }

  @Post('quick-sale')
  @Role(Roles.org)
  createQuickSale(
    @User('orgId') orgId: number,
    @Body() quickSaleDto: CreateQuickSaleDto,
  ) {
    return this.salesService.create(orgId, quickSaleDto);
  }

  @Get()
  @Role(Roles.org)
  findAll(@User('orgId') orgId: number, @Query() paginateQuery: PaginateQuery) {
    return this.salesService.findAll(orgId, paginateQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @User('orgId') orgId: number) {
    return this.salesService.findOne(id, orgId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSaleDto: UpdateQuickSaleDto,
    @User('orgId') orgId: number,
  ) {
    return this.salesService.update(id, updateSaleDto, orgId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User('orgId') orgId: number) {
    return this.salesService.remove(id, orgId);
  }
}
