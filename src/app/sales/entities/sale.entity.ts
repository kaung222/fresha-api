import { Client } from '@/app/clients/entities/client.entity';
import { Organization } from '@/app/organizations/entities/organization.entity';
import { User } from '@/app/users/entities/user.entity';
import { IncrementEntity } from '@/utils';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { SaleItem } from './sale-item.entity';
import { DecimalColumn } from '@/utils/decorators/column.decorators';

@Entity()
export class Sale extends IncrementEntity {
  @Column({ default: 'unknown' })
  username: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @DecimalColumn()
  totalPrice: number;

  @Column({ nullable: true })
  notes: string;

  @OneToMany(() => SaleItem, (item) => item.sale)
  saleItems: SaleItem[];

  @ManyToOne(() => Client)
  client: Client;

  @Column()
  orgId: number;

  @ManyToOne(() => Organization, { nullable: false })
  @JoinColumn({ name: 'orgId' })
  organization: Organization;
}
