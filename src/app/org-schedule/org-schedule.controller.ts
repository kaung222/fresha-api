import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OrgScheduleService } from './org-schedule.service';
import { CreateOrgScheduleDto } from './dto/create-org-schedule.dto';
import { UpdateOrgScheduleDto } from './dto/update-org-schedule.dto';
import { Roles, User } from '@/security/user.decorator';
import { Role } from '@/security/role.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('org-schedule')
@ApiTags('Organization Schedule')
@Role(Roles.org)
export class OrgScheduleController {
  constructor(private readonly orgScheduleService: OrgScheduleService) {}

  @Get()
  @ApiOperation({ summary: 'Get schedule of the org by org with access token' })
  findAll(@User('orgId') orgId: number) {
    return this.orgScheduleService.findAll(orgId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrgScheduleDto: UpdateOrgScheduleDto,
  ) {
    return this.orgScheduleService.update(+id, updateOrgScheduleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orgScheduleService.remove(+id);
  }
}
