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

  @Column({ nullable: true })
  profilePictureUrl: string;

  @Column('simple-array', { nullable: true })
  types: string[];

  @Column('float')
  rating: number;

  @Column('int')
  totalReviews: number;
}
