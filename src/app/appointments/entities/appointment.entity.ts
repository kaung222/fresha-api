import {
  generateOpt,
  getCurrentDate,
  IncrementEntity,
  UUIDEntity,
} from '@/utils';
import {
  BeforeInsert,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Gender, User } from '@/app/users/entities/user.entity';
import { Organization } from '@/app/organizations/entities/organization.entity';
import { DecimalColumn } from '@/utils/decorators/column.decorators';
import { BookingItem } from './booking-item.entity';

export enum BookingStatus {
  pending = 'pending',
  confirmed = 'confirmed',
  cancelled = 'cancelled',
  completed = 'completed',
}

@Entity()
export class Appointment extends UUIDEntity {
  @Column('date')
  date: string;

  @Column({ default: 'unknown' })
  username: string;

  @Column('int')
  token: number;

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

  @DecimalColumn()
  totalCommissionFees: number;

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

  @Index('orgId')
  @Column()
  orgId: number;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orgId' })
  organization: Organization;

  @BeforeInsert()
  generateToken() {
    this.token = parseInt(generateOpt());
  }
}
