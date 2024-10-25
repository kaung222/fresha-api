import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ApiTags } from '@nestjs/swagger';
import { User } from '@/security/user.decorator';

@Controller('services')
@ApiTags('Service')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  create(
    @Body() createServiceDto: CreateServiceDto,
    @User('orgId') orgId: number,
  ) {
    return this.servicesService.create(createServiceDto, orgId);
  }

  @Get()
  findAll(@User('orgId') orgId: number) {
    return this.servicesService.findAll(orgId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(+id, updateServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(+id);
  }
}
