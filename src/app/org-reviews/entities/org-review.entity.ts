import { Organization } from '@/app/organizations/entities/organization.entity';
import { User } from '@/app/users/entities/user.entity';
import { UUIDEntity } from '@/utils';
import { Column, ManyToOne } from 'typeorm';

export class OrgReview extends UUIDEntity {
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
