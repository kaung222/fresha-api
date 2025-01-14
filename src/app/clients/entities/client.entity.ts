import { Organization } from '@/app/organizations/entities/organization.entity';
import { Gender } from '@/app/users/entities/user.entity';
import { IncrementEntity } from '@/utils/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Client extends IncrementEntity {
  @Column()
  firstName: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  email: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  profilePicture?: string;

  @Column({ type: 'enum', enum: Gender, default: Gender.none })
  gender?: Gender;

  @Column('date', { nullable: true })
  dob: Date;

  @Index('orgId')
  @Column()
  orgId: number;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orgId' })
  organization: Organization;
}
