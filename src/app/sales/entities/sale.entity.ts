import { Client } from '@/app/clients/entities/client.entity';
import { Organization } from '@/app/organizations/entities/organization.entity';
import { Product } from '@/app/products/entities/product.entity';
import { User } from '@/app/users/entities/user.entity';
import { IncrementEntity } from '@/utils';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

@Entity()
export class Sale extends IncrementEntity {
  @Column('float')
  totalPrice: number;

  @Column({ default: 'unknown' })
  username: string;

  @Column({ nullable: true })
  notes: string;

  @ManyToMany(() => Product)
  @JoinTable()
  products: Product[];

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Client)
  client: Client;

  @ManyToOne(() => Organization)
  organization: Organization;
}
