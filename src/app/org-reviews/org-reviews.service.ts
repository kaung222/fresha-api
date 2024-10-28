import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrgReviewDto } from './dto/create-org-review.dto';
import { UpdateOrgReviewDto } from './dto/update-org-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrgReview } from './entities/org-review.entity';
import { DataSource, Repository } from 'typeorm';
import { Organization } from '../organizations/entities/organization.entity';

@Injectable()
export class OrgReviewsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(OrgReview)
    private readonly orgReviewRepository: Repository<OrgReview>,
  ) {}
  create(createOrgReviewDto: CreateOrgReviewDto, userId: number) {
    const { orgId, rating, notes } = createOrgReviewDto;
    const newReview = this.orgReviewRepository.create({
      organization: { id: orgId },
      user: { id: userId },
      rating,
      notes,
    });
    return this.orgReviewRepository.save(newReview);
  }

  findAll(orgId: number) {
    return this.orgReviewRepository.findAndCount({
      where: { organization: { id: orgId } },
      take: 10,
    });
  }

  findOne(id: number) {
    return this.orgReviewRepository.findAndCount({
      where: { id },
      relations: { organization: true, user: true },
    });
  }

  update(id: number, updateOrgReviewDto: UpdateOrgReviewDto) {
    return this.orgReviewRepository.update(id, updateOrgReviewDto);
  }

  async updateOrgRating(orgId: number) {
    const { totalReviews, totalRating } = await this.dataSource
      .getRepository(OrgReview)
      .createQueryBuilder('review')
      .where('review.organization.id=:orgId', { orgId })
      .select('SUM(review.rating)', 'totalRating')
      .addSelect('COUNT(*)', 'totalReviews')
      .getRawOne();
    const rating = totalRating / totalReviews;

    await this.dataSource.getRepository(Organization).update(orgId, {
      rating,
      totalReviews,
    });
  }

  remove(id: number) {
    return this.orgReviewRepository.delete(id);
  }

  async checkOwnership(id: number, userId: number) {
    const review = await this.orgReviewRepository.findOneBy({
      id,
      user: { id: userId },
    });
    if (!review) throw new NotFoundException('Review not found');
    return true;
  }
}
