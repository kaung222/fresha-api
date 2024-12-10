import { Organization } from '@/app/organizations/entities/organization.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Email {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  text: string;

  @Column({ nullable: true })
  recipientName: string;

  @Column()
  subject: string;

  @Column('simple-array')
  to: string[] | string;

  @Index('orgId')
  @Column()
  orgId: number;

  @Column({ nullable: true })
  sent_by: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'orgId' })
  organization: Organization;
}
