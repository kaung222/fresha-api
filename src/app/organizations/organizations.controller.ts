import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UnauthorizedException,
  ParseIntPipe,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginateQuery } from '@/utils/paginate-query.dto';
import { Role } from '@/security/role.decorator';
import { Roles, User } from '@/security/user.decorator';
import { UpdateCurrency } from './dto/update-currency';

@Controller('organizations')
@ApiTags('Organization')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  findAll(@Query() paginateQuery: PaginateQuery) {
    return this.organizationsService.findAll(paginateQuery);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.organizationsService.findOne(slug);
  }

  @Get('by/:id')
  findOneById(@Param('id') id: string) {
    return this.organizationsService.findOneById(+id);
  }

  @Get('in/:city')
  @ApiOperation({ summary: 'Find org in given city' })
  findInCity(@Param('city') city: string) {
    return this.organizationsService.findInCity(city);
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

  @Get(':id/products')
  @ApiOperation({ summary: 'Get products of organization' })
  findProducts(@Param('id') id: string) {
    return this.organizationsService.findProducts(+id);
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
    @User('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(+id, updateOrganizationDto);
  }

  @Post('currency')
  @ApiOperation({ summary: 'Change the currency' })
  @Role(Roles.org)
  updateCurrency(
    @User('id') id: string,
    @Body() updateCurrencyDto: UpdateCurrency,
  ) {
    return this.organizationsService.updateCurrencyDto(+id, updateCurrencyDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @User('orgId') orgId: number) {
    if (id != orgId)
      throw new UnauthorizedException('this org cannot be deleted');
    return this.organizationsService.removeOrg(+id);
  }
}
