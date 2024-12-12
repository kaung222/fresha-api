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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Role } from '@/security/role.decorator';
import { Roles, User } from '@/security/user.decorator';
import { ApiTags } from '@nestjs/swagger';
import { PaginateQuery } from '@/utils/paginate-query.dto';

@Controller('products')
@ApiTags('Product')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Role(Roles.org)
  create(
    @Body() createProductDto: CreateProductDto,
    @User('orgId') orgId: number,
  ) {
    return this.productsService.create(orgId, createProductDto);
  }

  @Get()
  @Role(Roles.org, Roles.member)
  findAll(@User('orgId') orgId: number, @Query() paginateQuery: PaginateQuery) {
    return this.productsService.findAll(orgId, paginateQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @Role(Roles.org)
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @User('orgId') orgId: number,
  ) {
    return this.productsService.update(id, updateProductDto, orgId);
  }

  @Delete(':id')
  @Role(Roles.org)
  remove(@Param('id') id: string, @User('orgId') orgId: number) {
    return this.productsService.remove(id, orgId);
  }
}
