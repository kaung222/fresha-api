import { Injectable } from '@nestjs/common';
import { CreateOrgReviewDto } from './dto/create-org-review.dto';
import { UpdateOrgReviewDto } from './dto/update-org-review.dto';

@Injectable()
export class OrgReviewsService {
  create(createOrgReviewDto: CreateOrgReviewDto) {
    return 'This action adds a new orgReview';
  }

  findAll() {
    return `This action returns all orgReviews`;
  }

  findOne(id: number) {
    return `This action returns a #${id} orgReview`;
  }

  update(id: number, updateOrgReviewDto: UpdateOrgReviewDto) {
    return `This action updates a #${id} orgReview`;
  }

  remove(id: number) {
    return `This action removes a #${id} orgReview`;
  }
}
