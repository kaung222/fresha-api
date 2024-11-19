import { Client } from '@/app/clients/entities/client.entity';
import { Member } from '@/app/members/entities/member.entity';
import { Organization } from '@/app/organizations/entities/organization.entity';
import { Product } from '@/app/products/entities/product.entity';
import { Service } from '@/app/services/entities/service.entity';
import { User } from '@/app/users/entities/user.entity';
import { UUIDEntity } from '@/utils';
import {
  Column,
  Entity,
  Generated,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';

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

  @Column({ default: 'unknown' })
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

  @ManyToMany(() => Service, (service) => service.payments)
  @JoinTable()
  services: Service[];

  @ManyToMany(() => Product, (product) => product.payments)
  @JoinTable()
  products: Product[];

  @ManyToOne(() => Organization)
  organization: Organization;
}
