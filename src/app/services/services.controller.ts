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
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ApiTags } from '@nestjs/swagger';
import { Roles, User } from '@/security/user.decorator';
import { Role } from '@/security/role.decorator';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { GetServicesDto } from './dto/get-service.dto';

@Controller('services')
@ApiTags('Service')
@Role(Roles.org)
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  create(
    @Body() createServiceDto: CreateServiceDto,
    @User('orgId') orgId: number,
  ) {
    return this.servicesService.create(createServiceDto, orgId);
  }

  @Post('package')
  createPackage(
    @Body() createPackageDto: CreatePackageDto,
    @User('orgId') orgId: number,
  ) {
    return this.servicesService.createPackage(orgId, createPackageDto);
  }

  @Patch('package/:id')
  updatePackage(
    @Param('id') id: string,
    @Body() updatePackageDto: UpdatePackageDto,
    @User('orgId') orgId: number,
  ) {
    return this.servicesService.updatePackage(+id, updatePackageDto, orgId);
  }

  @Get()
  findAll(@User('orgId') orgId: number, @Query() getServices: GetServicesDto) {
    return this.servicesService.findAll(orgId, getServices);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @User('orgId') orgId: number,
  ) {
    console.log(id, orgId, updateServiceDto);
    return this.servicesService.update(+id, updateServiceDto, orgId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User('orgId') orgId: number) {
    return this.servicesService.remove(+id, orgId);
  }
}
