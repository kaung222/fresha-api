import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Service } from '@/app/services/entities/service.entity';
import { Organization } from '@/app/organizations/entities/organization.entity';

export enum DiscountType {
  fixed = 'fixed',
  percent = 'percent',
  free = 'free',
}
@Entity()
export class Package {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { default: 0 })
  price: number;

  @Column({ nullable: true })
  name: string;

  @Column('int', { default: 0 })
  discount: number;

  @Column('enum', { enum: DiscountType, default: DiscountType.fixed })
  discountType: DiscountType;

  @Column('text')
  description: string;

  @ManyToMany(() => Service, (service) => service.packages, {
    eager: true,
    cascade: true,
  })
  @JoinColumn()
  services: Service[];

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization: Organization;
}
