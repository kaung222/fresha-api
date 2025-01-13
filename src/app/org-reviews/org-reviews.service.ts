import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

    // Check if a review already exists for the appointment and user
    const existingReview = await this.orgReviewRepository.findOneBy({
      appointmentId,
      userId,
    });
    if (existingReview) {
      throw new BadRequestException(
        'Review for this appointment already exists',
      );
    }

    // Verify the appointment exists and belongs to the user
    const appointment = await this.dataSource
      .getRepository(Appointment)
      .findOneBy({ id: appointmentId, userId });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Create a new review
    const newReview = this.orgReviewRepository.create({
      organization: { id: orgId },
      userId,
      rating,
      notes,
      appointment,
    });

    // Save the review and update the appointment rating simultaneously
    await Promise.all([
      this.orgReviewRepository.save(newReview),
      this.dataSource
        .getRepository(Appointment)
        .update(appointmentId, { rating }),
    ]);

    // Update the organization's overall rating
    await this.updateOrgRating(orgId);

    // Return success message
    return {
      message: 'Review submitted successfully',
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
