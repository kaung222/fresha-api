import { Service } from '@/app/services/entities/service.entity';
import { IncrementEntity } from '@/utils';
import { Entity, ManyToOne } from 'typeorm';
import { Appointment } from './appointment.entity';

// service appointment join table
@Entity()
export class ServiceAppointment extends IncrementEntity {
  @ManyToOne(() => Service, { onDelete: 'CASCADE', eager: true })
  service: Service;

  @ManyToOne(() => Appointment, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  appointment: Appointment;
}
