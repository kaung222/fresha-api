import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrgReviewsService } from './org-reviews.service';
import { CreateOrgReviewDto } from './dto/create-org-review.dto';
import { UpdateOrgReviewDto } from './dto/update-org-review.dto';

@Controller('org-reviews')
export class OrgReviewsController {
  constructor(private readonly orgReviewsService: OrgReviewsService) {}

  @Post()
  create(@Body() createOrgReviewDto: CreateOrgReviewDto) {
    return this.orgReviewsService.create(createOrgReviewDto);
  }

  @Get()
  findAll() {
    return this.orgReviewsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orgReviewsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrgReviewDto: UpdateOrgReviewDto) {
    return this.orgReviewsService.update(+id, updateOrgReviewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orgReviewsService.remove(+id);
  }
}
