import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OrgTypesService } from './org-types.service';
import { CreateOrgTypeDto } from './dto/create-org-type.dto';
import { Role } from '@/security/role.decorator';
import { Roles } from '@/security/user.decorator';

@Controller('org-types')
export class OrgTypesController {
  constructor(private readonly orgTypesService: OrgTypesService) {}

  @Post()
  @Role(Roles.admin)
  create(@Body() createOrgTypeDto: CreateOrgTypeDto) {
    return this.orgTypesService.create(createOrgTypeDto);
  }

  @Get()
  findAll() {
    return this.orgTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orgTypesService.findOne(+id);
  }

  @Delete(':id')
  @Role(Roles.admin)
  remove(@Param('id') id: string) {
    return this.orgTypesService.remove(+id);
  }
}
