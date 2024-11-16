import { Member } from '@/app/members/entities/member.entity';
import { Organization } from '@/app/organizations/entities/organization.entity';
import { UUIDEntity } from '@/utils';
import { Column, Entity, Generated, JoinColumn, ManyToOne } from 'typeorm';

export enum PaymentMethod {
  cash = 'Cash',
  kpay = 'KBZ pay',
  ayapay = 'AYA pay',
  wavepay = 'Wave Pay',
}

@Entity()
export class Payment extends UUIDEntity {
  @Generated('uuid')
  transactionId: number;

  @Column()
  clientName: string;

  @Column('enum', { enum: PaymentMethod })
  method: PaymentMethod;

  @Column('decimal')
  amount: number;

  @Column({ nullable: true })
  memberId: number;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'memberId' })
  member: Member;

  @ManyToOne(() => Organization)
  organization: Organization;
}
