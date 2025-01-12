import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PricingsService } from './pricings.service';
import { CreatePricingDto } from './dto/create-pricing.dto';
import { UpdatePricingDto } from './dto/update-pricing.dto';
import { Role } from '@/security/role.decorator';
import { Roles } from '@/security/user.decorator';
import { ApiTags } from '@nestjs/swagger';

@Controller('pricings')
@ApiTags('Pricing')
export class PricingsController {
  constructor(private readonly pricingsService: PricingsService) {}

  @Post()
  @Role(Roles.admin, Roles.sysadmin)
  create(@Body() createPricingDto: CreatePricingDto) {
    return this.pricingsService.create(createPricingDto);
  }

  @Get()
  findAll() {
    return this.pricingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pricingsService.findOne(+id);
  }
  @Role(Roles.admin)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePricingDto: UpdatePricingDto) {
    return this.pricingsService.update(+id, updatePricingDto);
  }
  @Role(Roles.admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pricingsService.remove(+id);
  }
}
