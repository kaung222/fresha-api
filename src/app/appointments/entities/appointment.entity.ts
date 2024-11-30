import { getCurrentDate, IncrementEntity } from '@/utils';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Gender, User } from '@/app/users/entities/user.entity';
import { Organization } from '@/app/organizations/entities/organization.entity';
import { Member } from '@/app/members/entities/member.entity';
import { Client } from '@/app/clients/entities/client.entity';
import { Service } from '@/app/services/entities/service.entity';
import { DecimalColumn } from '@/utils/decorators/column.decorators';
import { BookingItem } from './booking-item.entity';

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

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  profilePicture: string;

  @Column('enum', { enum: Gender, default: Gender.none })
  gender: Gender;

  @Column('float', { default: 0 })
  totalTime: number;

  @DecimalColumn()
  totalPrice: number;

  @DecimalColumn()
  discountPrice: number;

  @Column('boolean', { default: false })
  isOnlineBooking: boolean;

  @Column('int', { default: 0 })
  startTime: number; // in second

  @Column('int', { default: 0 })
  endTime: number; // in second

  // relationship
  // section
  @OneToMany(() => BookingItem, (item) => item.appointment)
  bookingItems: BookingItem[];

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  user: User;

  @Column()
  orgId: number;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orgId' })
  organization: Organization;
}
