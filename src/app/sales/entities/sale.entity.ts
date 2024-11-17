import { Client } from '@/app/clients/entities/client.entity';
import { Organization } from '@/app/organizations/entities/organization.entity';
import { User } from '@/app/users/entities/user.entity';
import { IncrementEntity } from '@/utils';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { SaleItem } from './sale-item.entity';

@Entity()
export class Sale extends IncrementEntity {
  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalPrice: number;

  @Column({ default: 'unknown' })
  username: string;

  @Column({ nullable: true })
  notes: string;

  @OneToMany(() => SaleItem, (item) => item.sale)
  saleItems: SaleItem;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Client)
  client: Client;

  @ManyToOne(() => Organization, { nullable: false })
  organization: Organization;
}
