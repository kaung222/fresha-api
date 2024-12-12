import { Organization } from '@/app/organizations/entities/organization.entity';
import { UUIDEntity } from '@/utils';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { SaleItem } from './sale-item.entity';
import { DecimalColumn } from '@/utils/decorators/column.decorators';
import { BookingStatus } from '@/app/appointments/entities/appointment.entity';

@Entity()
export class Sale extends UUIDEntity {
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

  @Column('enum', { enum: BookingStatus, default: BookingStatus.completed })
  status: BookingStatus;

  @OneToMany(() => SaleItem, (item) => item.sale)
  saleItems: SaleItem[];

  @Index('orgId')
  @Column()
  orgId: number;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orgId' })
  organization: Organization;
}
