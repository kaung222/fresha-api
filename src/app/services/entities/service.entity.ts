import { Appointment } from '@/app/appointments/entities/appointment.entity';
import { Category } from '@/app/categories/entities/category.entity';
import { Member } from '@/app/members/entities/member.entity';
import { Organization } from '@/app/organizations/entities/organization.entity';
import { Payment } from '@/app/payments/entities/payment.entity';
import { IncrementEntity } from '@/utils/base.entity';
import { DecimalColumn } from '@/utils/decorators/column.decorators';
import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  Index,
  JoinTable,
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

export enum ServiceType {
  service = 'Single Service',
  package = 'Package',
}

export enum DiscountType {
  fixed = 'fixed',
  percent = 'percent',
  free = 'free',
}

@Entity()
export class Service extends IncrementEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @DecimalColumn()
  price: number;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'enum', enum: TargetGender, default: TargetGender.all })
  targetGender: TargetGender;

  @Column({ nullable: true })
  duration: number;

  @Column('int', { default: 0 })
  discount: number;

  @Column('int', { default: 0 })
  discountPrice: number;

  @Column('enum', { enum: DiscountType, default: DiscountType.fixed })
  discountType: DiscountType;

  @Column('enum', { enum: PriceType, default: PriceType.fixed })
  priceType: PriceType;

  @Column('enum', { enum: ServiceType, default: ServiceType.service })
  type: ServiceType;

  @Index('orgId')
  @Column()
  orgId: number;

  @ManyToOne(() => Category, { onDelete: 'SET NULL', eager: true })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orgId' })
  organization: Organization;
  @ManyToMany(() => Member, (member) => member.services)
  members: Member[];

  @ManyToMany(() => Service, (service) => service.services)
  @JoinTable({ name: 'service_package' })
  packages: Service[];

  @ManyToMany(() => Service, (service) => service.packages)
  services: Service[];

  @ManyToMany(() => Appointment, (appointment) => appointment.services)
  appointments: Appointment[];

  @ManyToMany(() => Payment, (payment) => payment.services)
  payments: Payment[];
}
