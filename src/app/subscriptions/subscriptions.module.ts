import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { PricingsService } from '../pricings/pricings.service';
import { Pricing } from '../pricings/entities/pricing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, Pricing])],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, PricingsService],
})
export class SubscriptionsModule {}
