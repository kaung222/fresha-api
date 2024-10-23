import { Injectable } from '@nestjs/common';
import { CreateMemberReviewDto } from './dto/create-member-review.dto';
import { UpdateMemberReviewDto } from './dto/update-member-review.dto';

@Injectable()
export class MemberReviewsService {
  create(createMemberReviewDto: CreateMemberReviewDto) {
    return 'This action adds a new memberReview';
  }

  findAll() {
    return `This action returns all memberReviews`;
  }

  findOne(id: number) {
    return `This action returns a #${id} memberReview`;
  }

  update(id: number, updateMemberReviewDto: UpdateMemberReviewDto) {
    return `This action updates a #${id} memberReview`;
  }

  remove(id: number) {
    return `This action removes a #${id} memberReview`;
  }
}
