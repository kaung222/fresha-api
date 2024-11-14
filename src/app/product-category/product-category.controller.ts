import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductCategoryService } from './product-category.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@/security/role.decorator';
import { Roles, User } from '@/security/user.decorator';

@Controller('product-category')
@ApiTags('Product category')
@Role(Roles.org)
export class ProductCategoryController {
  constructor(
    private readonly productCategoryService: ProductCategoryService,
  ) {}

  @Post()
  create(
    @User('orgId') orgId: number,
    @Body() createProductCategoryDto: CreateProductCategoryDto,
  ) {
    return this.productCategoryService.create(orgId, createProductCategoryDto);
  }

  @Get()
  findAll(@User('orgId') orgId: number) {
    return this.productCategoryService.findAll(orgId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productCategoryService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductCategoryDto: UpdateProductCategoryDto,
    @User('orgId') orgId: number,
  ) {
    await this.productCategoryService.checkOwnership(+id, orgId);

    return this.productCategoryService.update(+id, updateProductCategoryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @User('orgId') orgId: number) {
    await this.productCategoryService.checkOwnership(+id, orgId);
    return this.productCategoryService.remove(+id);
  }
}
