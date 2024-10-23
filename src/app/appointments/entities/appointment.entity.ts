import { IncrementEntity } from '@/utils';
import { Column, Entity, OneToMany } from 'typeorm';
import { BookingItem } from './booking-item.entity';

export enum BookingStatus {
  pending = 'pending',
  confirmed = 'confirmed',
  cancelled = 'cancelled',
  completed = 'completed',
}

export enum GenderEnum {
  male = 'male',
  female = 'female',
}

@Entity()
export class Appointment extends IncrementEntity {
  @Column()
  date: Date;

  @Column()
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column('enum', {
    default: 'pending',
    enum: BookingStatus,
  })
  status: BookingStatus;

  @Column({ nullable: true })
  phone: string;

  @Column('enum', { enum: GenderEnum })
  gender: GenderEnum;

  @OneToMany(() => BookingItem, (item) => item.appointment)
  bookingItems: BookingItem[];
}
