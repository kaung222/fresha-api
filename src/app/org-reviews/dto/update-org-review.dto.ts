import { PartialType } from '@nestjs/swagger';
import { CreateOrgReviewDto } from './create-org-review.dto';

export class UpdateOrgReviewDto extends PartialType(CreateOrgReviewDto) {}
