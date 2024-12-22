import { Currency } from '@/app/features/entities/feature.entity';
import { IncrementEntity } from '@/utils/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity()
export class Organization extends IncrementEntity {
  @Column()
  name: string;

  @Column({ nullable: true, unique: true })
  email: string;

  @Column('simple-array', { nullable: true })
  phones: string[];

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  notes: string;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column('json', { nullable: true })
  types: string[];

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column('float', { default: 0 })
  rating: number;

  @Column('int', { default: 0 })
  totalReviews: number;

  @Column('enum', { enum: Currency, default: Currency.mmk })
  currency: Currency;

  @Column('boolean', { default: false, select: false })
  isPublished: boolean;

  @Index('org-slug')
  @Column({ nullable: true, unique: true })
  slug: string;
}
