import { Module } from '@nestjs/common';
import { MemberReviewsService } from './member-reviews.service';
import { MemberReviewsController } from './member-reviews.controller';

@Module({
  controllers: [MemberReviewsController],
  providers: [MemberReviewsService],
})
export class MemberReviewsModule {}
