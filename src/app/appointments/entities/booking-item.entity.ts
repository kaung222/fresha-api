import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Appointment } from './appointment.entity';
import { Member } from '@/app/members/entities/member.entity';
import { Service } from '@/app/services/entities/service.entity';
import { DecimalColumn } from '@/utils/decorators/column.decorators';

@Entity()
export class BookingItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  serviceName: string;

  @Column({ nullable: true })
  memberName: string;

  @Column({ nullable: true })
  serviceId: number;

  @Column({ nullable: true })
  memberId: number;

  @Column({ nullable: true })
  appointmentId: string;

  @Column('int')
  startTime: number;

  @Column('int')
  endTime: number;

  @DecimalColumn()
  price: number;

  @Column('int')
  duration: number;

  @DecimalColumn()
  discountPrice: number;

  @DecimalColumn()
  commissionFees: number;

  @ManyToOne(() => Appointment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;

  @ManyToOne(() => Member, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'memberId' })
  member: Member;

  @ManyToOne(() => Service, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'serviceId' })
  service: Service;
}
