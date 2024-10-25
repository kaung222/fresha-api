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
import { ApiTags } from '@nestjs/swagger';
import { PaginateQuery } from '@/utils/paginate-query.dto';

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

  @Get(':id/categories')
  findCategories(@Param('id') id: string) {
    return this.organizationsService.findCategories(+id);
  }

  @Get(':id/team')
  findTeam(@Param('id') id: string) {
    return this.organizationsService.findTeam(+id);
  }

  @Get(':id/reviews')
  findReviews(@Param('id') id: string, @Query() paginateQuery: PaginateQuery) {
    return this.organizationsService.findReviews(+id, paginateQuery);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(+id, updateOrganizationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizationsService.remove(+id);
  }
}
