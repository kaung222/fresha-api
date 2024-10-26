import { IncrementEntity } from '@/utils';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BookingItem } from './booking-item.entity';
import { User } from '@/app/users/entities/user.entity';
import { Organization } from '@/app/organizations/entities/organization.entity';

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

  @Column('enum', { enum: GenderEnum, nullable: true })
  gender: GenderEnum;

  @OneToMany(() => BookingItem, (item) => item.appointment)
  bookingItems: BookingItem[];

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization: Organization;
}
