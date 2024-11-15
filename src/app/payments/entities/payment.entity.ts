import { Member } from '@/app/members/entities/member.entity';
import { Organization } from '@/app/organizations/entities/organization.entity';
import { UUIDEntity } from '@/utils';
import { Column, Entity, ManyToOne } from 'typeorm';

export enum PaymentMethod {
  cash = 'Cash',
  kpay = 'KBZ pay',
  ayapay = 'AYA pay',
  wavepay = 'Wave Pay',
}

@Entity()
export class Payment extends UUIDEntity {
  @Column('uuid')
  transactionId: number;

  @Column()
  clientName: string;

  @Column('enum', { enum: PaymentMethod })
  method: PaymentMethod;

  @ManyToOne(() => Member)
  member: Member;

  @Column('decimal')
  amount: number;

  @ManyToOne(() => Organization)
  organization: Organization;
}
