import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { OrgTypesService } from './org-types.service';
import { CreateOrgTypeDto } from './dto/create-org-type.dto';
import { Role } from '@/security/role.decorator';
import { Roles, User } from '@/security/user.decorator';
import { ApiTags } from '@nestjs/swagger';

@Controller('org-types')
@ApiTags('Org Types')
export class OrgTypesController {
  constructor(private readonly orgTypesService: OrgTypesService) {}

  @Post()
  @Role(Roles.admin)
  create(
    @User('id') adminId: string,
    @Body() createOrgTypeDto: CreateOrgTypeDto,
  ) {
    return this.orgTypesService.create(adminId, createOrgTypeDto);
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
  remove(@Param('id') id: string, @User('id') adminId: string) {
    return this.orgTypesService.remove(+id, adminId);
  }
}
