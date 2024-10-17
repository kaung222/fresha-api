import { IncrementEntity } from '@/utils/base.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity()
export class Category extends IncrementEntity {
  @Column()
  name: string;

  @Index('creatorId')
  @Column()
  creatorId: string;

  @Column({ nullable: true })
  notes: string;
}
