import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MemberReviewsService } from './member-reviews.service';
import { CreateMemberReviewDto } from './dto/create-member-review.dto';
import { UpdateMemberReviewDto } from './dto/update-member-review.dto';

@Controller('member-reviews')
export class MemberReviewsController {
  constructor(private readonly memberReviewsService: MemberReviewsService) {}

  @Post()
  create(@Body() createMemberReviewDto: CreateMemberReviewDto) {
    return this.memberReviewsService.create(createMemberReviewDto);
  }

  @Get()
  findAll() {
    return this.memberReviewsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.memberReviewsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMemberReviewDto: UpdateMemberReviewDto) {
    return this.memberReviewsService.update(+id, updateMemberReviewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.memberReviewsService.remove(+id);
  }
}
