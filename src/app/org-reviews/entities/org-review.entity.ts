import { Appointment } from '@/app/appointments/entities/appointment.entity';
import { Organization } from '@/app/organizations/entities/organization.entity';
import { User } from '@/app/users/entities/user.entity';
import { UUIDEntity } from '@/utils';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

@Entity()
export class OrgReview extends UUIDEntity {
  @Column({ type: 'float' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  orgId: number;

  @ManyToOne(() => Organization, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orgId' })
  organization: Organization;

  @Column({ nullable: true })
  appointmentId: string;

  @OneToOne(() => Appointment, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'appointmentId' })
  appointment: Appointment;
}
