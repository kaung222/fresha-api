import { Member } from '@/app/members/entities/member.entity';
import { Service } from '@/app/services/entities/service.entity';
import { UUIDEntity } from '@/utils';
import { Entity, ManyToOne } from 'typeorm';
import { Appointment } from './appointment.entity';

@Entity()
export class BookingItem extends UUIDEntity {
  @ManyToOne(() => Service)
  service: Service;

  @ManyToOne(() => Member)
  member: Member;

  @ManyToOne(() => Appointment)
  appointment: Appointment;
}
