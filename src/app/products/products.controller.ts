import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Role } from '@/security/role.decorator';
import { Roles, User } from '@/security/user.decorator';

@Controller('products')
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
  findAll(@User('orgId') orgId: number) {
    return this.productsService.findAll(orgId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  @Role(Roles.org)
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @User('orgId') orgId: number,
  ) {
    await this.productsService.checkOwnership(+id, orgId);
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  @Role(Roles.org)
  async remove(@Param('id') id: string, @User('orgId') orgId: number) {
    await this.productsService.checkOwnership(+id, orgId);
    return this.productsService.remove(+id);
  }
}
