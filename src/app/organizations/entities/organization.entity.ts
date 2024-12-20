import { Currency } from '@/app/features/entities/feature.entity';
import { IncrementEntity } from '@/utils/base.entity';
import { Column, Entity } from 'typeorm';

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

  @Column('simple-array', { nullable: true })
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
}

// SELECT a.city AS from_city, b.city AS to_city,
//    111.111 *
//     DEGREES(ACOS(LEAST(1.0, COS(RADIANS(a.Latitude))
//          * COS(RADIANS(b.Latitude))
//          * COS(RADIANS(a.Longitude - b.Longitude))
//          + SIN(RADIANS(a.Latitude))
//          * SIN(RADIANS(b.Latitude))))) AS distance_in_km
//   FROM city AS a
//   JOIN city AS b ON a.id <> b.id
//  WHERE a.city = 3 AND b.city = 7
