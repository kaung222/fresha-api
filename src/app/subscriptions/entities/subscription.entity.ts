import { Entity, Column, ManyToOne } from 'typeorm'; // Importing the Pricing entity
import { UUIDEntity } from '@/utils';
import { Pricing } from '@/app/pricings/entities/pricing.entity';

@Entity()
export class Subscription extends UUIDEntity {
  @Column()
  orgId: number; // The ID of the subscribed user (could link to a User table)

  @ManyToOne(() => Pricing, (pricing) => pricing.id)
  pricingPlan: Pricing; // Reference to the Pricing entity

  @Column({ type: 'timestamp' })
  startDate: Date; // The start date of the subscription

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date | null; // The end date of the subscription (null if active)

  @Column({ default: 'active' })
  status: 'active' | 'paused' | 'cancelled' | 'expired'; // Status of the subscription

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amountPaid: number | null; // Amount paid for the subscription (optional)

  @Column({ type: 'int', nullable: true })
  renewalPeriod: number | null; // Duration for renewal in days (e.g., 30 for monthly)

  @Column({ default: false })
  isAutoRenew: boolean; // Indicates if the subscription auto-renews

  @Column({ type: 'timestamp', nullable: true })
  renewalDate: Date | null; // Date for the next renewal (if auto-renew is enabled)
}
