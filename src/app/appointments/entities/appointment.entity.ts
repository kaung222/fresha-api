import { IncrementEntity } from '@/utils';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { ServiceAppointment } from './serviceappointment.entity';
import { Gender, User } from '@/app/users/entities/user.entity';
import { Organization } from '@/app/organizations/entities/organization.entity';
import { Member } from '@/app/members/entities/member.entity';
import { Client } from '@/app/clients/entities/client.entity';

export enum BookingStatus {
  pending = 'pending',
  confirmed = 'confirmed',
  cancelled = 'cancelled',
  completed = 'completed',
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

  @Column('enum', { enum: Gender, default: Gender.none })
  gender: Gender;

  @OneToMany(() => ServiceAppointment, (item) => item.appointment)
  bookingItems: ServiceAppointment[];

  @Column('float', { default: 0 })
  totalTime: number;

  @Column('float', { default: 0 })
  totalPrice: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  user: User;

  @ManyToOne(() => Client, { onDelete: 'SET NULL' })
  client: Client;

  @ManyToOne(() => Member)
  member: Member;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization: Organization;
}
