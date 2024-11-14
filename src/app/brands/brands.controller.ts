import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Roles, User } from '@/security/user.decorator';
import { Role } from '@/security/role.decorator';
import { ApiTags } from '@nestjs/swagger';

@Controller('brands')
@Role(Roles.org)
@ApiTags('Product Brand')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  create(@User('orgId') orgId: number, @Body() createBrandDto: CreateBrandDto) {
    return this.brandsService.create(orgId, createBrandDto);
  }

  @Get()
  findAll(@User('orgId') orgId: number) {
    return this.brandsService.findAll(orgId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandsService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
    @User('orgId') orgId: number,
  ) {
    await this.brandsService.checkOwnership(+id, orgId);
    return this.brandsService.update(+id, updateBrandDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @User('orgId') orgId: number) {
    await this.brandsService.checkOwnership(+id, orgId);
    return this.brandsService.remove(+id);
  }
}
