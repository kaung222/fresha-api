import { Module } from '@nestjs/common';
import { OrgReviewsService } from './org-reviews.service';
import { OrgReviewsController } from './org-reviews.controller';

@Module({
  controllers: [OrgReviewsController],
  providers: [OrgReviewsService],
})
export class OrgReviewsModule {}
