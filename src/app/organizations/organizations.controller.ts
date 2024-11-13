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
import { OrganizationsService } from './organizations.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginateQuery } from '@/utils/paginate-query.dto';
import { AddAppointmentDto } from '../clients/dto/create-appointment.dto';
import { Role } from '@/security/role.decorator';
import { Roles, User } from '@/security/user.decorator';

@Controller('organizations')
@ApiTags('Organization')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  findAll(@Query() paginateQuery: PaginateQuery) {
    return this.organizationsService.findAll(paginateQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(+id);
  }

  @Get('info/profile')
  @Role(Roles.org)
  @ApiOperation({ summary: 'Get profile with access token' })
  getProfile(@User('orgId') orgId: number) {
    return this.organizationsService.getProfile(orgId);
  }

  @Get(':id/categories')
  findCategories(@Param('id') id: string) {
    return this.organizationsService.findCategories(+id);
  }

  @Get(':id/team')
  @ApiOperation({ summary: 'Get team members of organization' })
  findTeam(@Param('id') id: string) {
    return this.organizationsService.findTeam(+id);
  }

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Get reviews of organization' })
  findReviews(@Param('id') id: string, @Query() paginateQuery: PaginateQuery) {
    return this.organizationsService.findReviews(+id, paginateQuery);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update the organization details' })
  @Role(Roles.org)
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(+id, updateOrganizationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // return this.organizationsService.remove(+id);
  }
}
