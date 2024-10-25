import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiTags } from '@nestjs/swagger';
import { Org, Roles, User } from '@/security/user.decorator';
import { Role } from '@/security/role.decorator';

@Controller('categories')
@ApiTags('Service Category')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Role(Roles.member, Roles.org)
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @User('orgId') orgId: number,
  ) {
    return this.categoriesService.create(createCategoryDto, orgId);
  }

  @Get()
  @Role(Roles.member, Roles.org)
  findAll(@User('orgId') orgId: number) {
    return this.categoriesService.findAll(orgId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @Get(':orgId/services')
  findOneWithServices(@Param('orgId') orgId: string) {
    return this.categoriesService.findManyWithServices(+orgId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @User('orgId') orgId: number,
  ) {
    await this.categoriesService.checkOwnership(+id, orgId);
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @User('orgId') orgId: number) {
    await this.categoriesService.checkOwnership(+id, orgId);
    return this.categoriesService.remove(+id);
  }
}
