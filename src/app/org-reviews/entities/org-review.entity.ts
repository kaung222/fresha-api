import { Organization } from '@/app/organizations/entities/organization.entity';
import { User } from '@/app/users/entities/user.entity';
import { IncrementEntity } from '@/utils';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class OrgReview extends IncrementEntity {
  @Column({ type: 'float' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Organization, {
    onDelete: 'CASCADE',
  })
  organization: Organization;
}
