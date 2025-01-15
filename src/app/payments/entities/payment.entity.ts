import { Appointment } from '@/app/appointments/entities/appointment.entity';
import { Organization } from '@/app/organizations/entities/organization.entity';
import { Sale } from '@/app/sales/entities/sale.entity';
import { UUIDEntity } from '@/utils';
import { DecimalColumn } from '@/utils/decorators/column.decorators';
import {
  Column,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToOne,
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

  @Column('enum', { enum: PaymentMethod, default: PaymentMethod.cash })
  method: PaymentMethod;

  @DecimalColumn()
  amount: number;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  appointmentId: string;

  @OneToOne(() => Appointment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  @Column({ nullable: true })
  saleId: string;

  @OneToOne(() => Sale, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'saleId' })
  sale: Sale;

  @Column('int')
  orgId: number;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization: Organization;
}
