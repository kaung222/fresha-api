import { IncrementEntity } from '@/utils/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Organization extends IncrementEntity {
  @Column()
  name: string;

  @Column('simple-array', { nullable: true })
  phones: string[];

  @Column({ nullable: true, select: false })
  address: string;

  @Column({ nullable: true, select: false })
  notes: string;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column('simple-array', { nullable: true })
  types: string[];

  latitude: string;
  longitude: string;

  @Column('float', { default: 0 })
  rating: number;

  @Column('int', { default: 0 })
  totalReviews: number;

  @Column('boolean', { default: false })
  isPublished: boolean;
}
