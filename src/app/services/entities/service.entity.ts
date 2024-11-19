import { Appointment } from '@/app/appointments/entities/appointment.entity';
import { Category } from '@/app/categories/entities/category.entity';
import { Member } from '@/app/members/entities/member.entity';
import { Organization } from '@/app/organizations/entities/organization.entity';
import { Package } from '@/app/packages/entities/package.entity';
import { Payment } from '@/app/payments/entities/payment.entity';
import { IncrementEntity } from '@/utils/base.entity';
import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  Index,
} from 'typeorm';

export enum TargetGender {
  all = 'all',
  male = 'male',
  female = 'female',
}

export enum PriceType {
  fixed = 'fixed',
  from = 'from',
  free = 'free',
}

@Entity()
export class Service extends IncrementEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'enum', enum: TargetGender, default: TargetGender.all })
  targetGender: TargetGender;

  @Column({ nullable: true })
  duration?: number; // in minutes

  @ManyToMany(() => Member, (member) => member.services, {
    onDelete: 'CASCADE',
  })
  members: Member[];

  @Column('enum', { enum: PriceType, default: PriceType.fixed })
  priceType: PriceType;

  @Column({ nullable: true })
  categoryId: number;

  @ManyToOne(() => Category, { onDelete: 'SET NULL', eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Index('orgId')
  @Column()
  orgId: number;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orgId' })
  organization: Organization;

  @ManyToMany(() => Package, (pack) => pack.services, { onDelete: 'NO ACTION' })
  packages: Package[];

  @ManyToMany(() => Appointment, (appointment) => appointment.services)
  appointments: Appointment[];

  @ManyToMany(() => Payment, (payment) => payment.services)
  payments: Payment[];
}
