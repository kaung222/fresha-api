import { Organization } from '@/app/organizations/entities/organization.entity';
import { User } from '@/app/users/entities/user.entity';
import { UUIDEntity } from '@/utils';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class OrgReview extends UUIDEntity {
  @Column({ type: 'float' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Organization, {
    onDelete: 'CASCADE',
  })
  organization: Organization;
}
