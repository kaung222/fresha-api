import { IncrementEntity } from '@/utils';
import { DecimalColumn } from '@/utils/decorators/column.decorators';
import { Column, Entity } from 'typeorm';

@Entity()
export class Pricing extends IncrementEntity {
  @Column()
  title: string; // Title of the subscription plan

  @Column()
  description: string; // Brief description of the plan

  @DecimalColumn()
  price: number; // Price of the subscription plan

  @Column()
  currency: string; // Currency code (e.g., USD, EUR)

  @Column({ default: false })
  isPopular: boolean; // Marks the plan as a "popular" choice

  @Column('simple-array')
  features: string[]; // List of features included in the plan

  @Column({ default: false })
  isActive: boolean; // Indicates if the plan is active or deprecated

  @Column({ type: 'int', default: 0 })
  trialPeriod: number; // Trial period duration in days
}
