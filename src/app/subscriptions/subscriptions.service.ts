import { Injectable } from '@nestjs/common';
import { SubscribeDto } from './dto/subscribe.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { Repository } from 'typeorm';
import { PricingsService } from '../pricings/pricings.service';
import { addDays } from 'date-fns';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly pricingService: PricingsService,
  ) {}
  async subscribe(orgId: number, subscribeDto: SubscribeDto) {
    const pricing = await this.pricingService.findOne(subscribeDto.pricingId);
    const endDate = addDays(new Date(), pricing.trialPeriod);
    const createSubscription = this.subscriptionRepository.create({
      amountPaid: pricing.price,
      startDate: new Date(),
      endDate,
      orgId,
      status: 'active',
      pricingPlan: pricing,
    });
    return await this.subscriptionRepository.save(createSubscription);
  }
}
