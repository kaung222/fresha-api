import { getCurrentDate, IncrementEntity } from '@/utils';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';
import { Gender, User } from '@/app/users/entities/user.entity';
import { Organization } from '@/app/organizations/entities/organization.entity';
import { Member } from '@/app/members/entities/member.entity';
import { Client } from '@/app/clients/entities/client.entity';
import { Service } from '@/app/services/entities/service.entity';
import { DecimalColumn } from '@/utils/decorators/column.decorators';

export enum BookingStatus {
  pending = 'pending',
  confirmed = 'confirmed',
  cancelled = 'cancelled',
  completed = 'completed',
}

@Entity()
export class Appointment extends IncrementEntity {
  @Column('date', { default: getCurrentDate() })
  date: string;

  @Column({ default: 'unknown' })
  username: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column('enum', {
    default: BookingStatus.pending,
    enum: BookingStatus,
  })
  status: BookingStatus;

  @Column()
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column('enum', { enum: Gender, default: Gender.none })
  gender: Gender;

  @Column('float', { default: 0 })
  totalTime: number;

  @DecimalColumn()
  totalPrice: number;

  @DecimalColumn()
  discountPrice: number;

  @Column({ nullable: true })
  memberId: number;

  @Column('boolean', { default: false })
  isOnlineBooking: boolean;

  @Column('int')
  startTime: number; // in second

  @Column('int')
  endTime: number; // in second

  @DecimalColumn({ default: 0 })
  commissionFees: number;

  @DecimalColumn({ default: 0 })
  tips: number;

  @ManyToMany(() => Service, (service) => service.appointments, {
    eager: true,
  })
  @JoinTable()
  services: Service[];

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  user: User;

  @ManyToOne(() => Client, { onDelete: 'SET NULL' })
  client: Client;

  @ManyToOne(() => Member, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'memberId' })
  member: Member;

  @Column()
  orgId: number;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orgId' })
  organization: Organization;
}
