import { Organization } from '@/app/organizations/entities/organization.entity';
import { Payment } from '@/app/payments/entities/payment.entity';
import { IncrementEntity } from '@/utils';
import { Column, Entity, ManyToMany, ManyToOne } from 'typeorm';

@Entity()
export class Product extends IncrementEntity {
  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @Column()
  name: string;

  @Column({ nullable: true })
  code: string;

  @Column('float', {})
  price: number;

  @Column({ nullable: true })
  brand: string;

  @Column('text')
  description: string;

  @Column({ nullable: true })
  category: string;

  @Column('boolean', { default: true })
  instock: boolean;

  @Column('int', { default: 1 })
  moq: number;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization: Organization;

  @ManyToMany(() => Payment, (payment) => payment.products)
  payments: Payment[];
}
