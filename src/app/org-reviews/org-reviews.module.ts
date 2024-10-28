import { Module } from '@nestjs/common';
import { OrgReviewsService } from './org-reviews.service';
import { OrgReviewsController } from './org-reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrgReview } from './entities/org-review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrgReview])],
  controllers: [OrgReviewsController],
  providers: [OrgReviewsService],
})
export class OrgReviewsModule {}
