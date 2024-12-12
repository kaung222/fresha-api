import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { OrgReviewsService } from './org-reviews.service';
import { CreateOrgReviewDto } from './dto/create-org-review.dto';
import { Roles, User } from '@/security/user.decorator';
import { Role } from '@/security/role.decorator';
import { ApiTags } from '@nestjs/swagger';

@Controller('org-reviews')
@ApiTags('Organzation review')
export class OrgReviewsController {
  constructor(private readonly orgReviewsService: OrgReviewsService) {}

  @Post()
  @Role(Roles.user)
  create(
    @Body() createOrgReviewDto: CreateOrgReviewDto,
    @User('id') userId: string,
  ) {
    return this.orgReviewsService.create(createOrgReviewDto, userId);
  }

  @Get()
  @Role(Roles.org)
  findAll(@User('orgId') orgId: number) {
    return this.orgReviewsService.findAll(orgId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orgReviewsService.findOne(id);
  }

  @Delete(':id')
  @Role(Roles.user)
  remove(@Param('id') id: string, @User('id') userId: number) {
    return this.orgReviewsService.remove(id);
  }
}
