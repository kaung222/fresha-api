import { Organization } from '@/app/organizations/entities/organization.entity';
import { UUIDEntity } from '@/utils';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

export enum MailTo {
  client = 'clients',
  members = 'members',
  custom = 'custom',
}

@Entity()
export class Email extends UUIDEntity {
  id: string;

  @Column('text')
  text: string;

  @Column()
  subject: string;

  @Column('enum', { enum: MailTo, default: MailTo.custom })
  mailTo: MailTo;

  @Column({ nullable: true, type: 'simple-array' })
  to: string[] | string;

  @Column({ nullable: true })
  from: string;

  @Index('orgId')
  @Column()
  orgId: number;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'orgId' })
  organization: Organization;
}
