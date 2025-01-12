import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrgReviewDto } from './dto/create-org-review.dto';
import { UpdateOrgReviewDto } from './dto/update-org-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrgReview } from './entities/org-review.entity';
import { DataSource, Repository } from 'typeorm';
import { Organization } from '../organizations/entities/organization.entity';
import { PaginationResponse } from '@/utils/paginate-res.dto';
import { CacheService } from '@/global/cache.service';
import { Appointment } from '../appointments/entities/appointment.entity';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class OrgReviewsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(OrgReview)
    private readonly orgReviewRepository: Repository<OrgReview>,
  ) {}

  // create review by user to an org
  async create(createOrgReviewDto: CreateOrgReviewDto, userId: string) {
    const { orgId, rating, notes, appointmentId } = createOrgReviewDto;
    const appointment = await this.dataSource
      .getRepository(Appointment)
      .findOneBy({ userId, id: appointmentId });
    if (!appointment) throw new NotFoundException('Appointment not found');
    const newReview = this.orgReviewRepository.create({
      organization: { id: orgId },
      userId,
      rating,
      notes,
      appointment,
    });
    await this.orgReviewRepository.save(newReview);
    await this.updateOrgRating(orgId);
    return {
      message: 'Submit a review successfully',
    };
  }

  async findAll(orgId: number, page = 1) {
    const [data, totalCount] = await this.orgReviewRepository.findAndCount({
      where: { orgId },
      take: 10,
      skip: 10 * (page - 1),
      relations: { user: true },
    });
    return new PaginationResponse({ data, totalCount, page }).toResponse();
  }

  findOne(id: string) {
    return this.orgReviewRepository.findOne({
      where: { id },
      relations: { user: true },
    });
  }

  // update(id: string, updateOrgReviewDto: UpdateOrgReviewDto) {
  //   return this.orgReviewRepository.update(id, updateOrgReviewDto);
  // }

  async updateOrgRating(orgId: number) {
    const { totalReviews, totalRating } = await this.dataSource
      .getRepository(OrgReview)
      .createQueryBuilder('review')
      .where('review.organization=:orgId', { orgId })
      .select('SUM(review.rating)', 'totalRating')
      .addSelect('COUNT(*)', 'totalReviews')
      .getRawOne();
    const rating = totalRating / totalReviews;

    await this.dataSource.getRepository(Organization).update(orgId, {
      rating,
      totalReviews,
    });
  }

  remove(id: string) {
    return this.orgReviewRepository.delete(id);
  }

  // async checkOwnership(id: string, userId: string) {
  //   const review = await this.orgReviewRepository.findOneBy({
  //     id,
  //     userId,
  //   });
  //   if (!review) throw new NotFoundException('Review not found');
  //   return true;
  // }
}
