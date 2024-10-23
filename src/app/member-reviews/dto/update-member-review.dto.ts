import { PartialType } from '@nestjs/swagger';
import { CreateMemberReviewDto } from './create-member-review.dto';

export class UpdateMemberReviewDto extends PartialType(CreateMemberReviewDto) {}
