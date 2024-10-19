import { IncrementEntity } from '@/utils/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Organization extends IncrementEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column('simple-array', { nullable: true })
  phones: string[];

  @Column({ nullable: true, select: false })
  address: string;

  @Column({ nullable: true, select: false })
  notes: string;

  @Column({ nullable: true })
  profilePictureUrl: string;

  @Column('simple-array')
  types: string[];
}
