import { DayOfWeek } from '@/app/member-schedule/entities/member-schedule.entity';
import { Organization } from '@/app/organizations/entities/organization.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export class TimePeriod {
  startTime: number;
  endTime: number;
}
export class OneDayDuty {
  workingHours: TimePeriod;
  breakTimes?: TimePeriod[];
}

@Entity()
export class OrgSchedule {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('int', { default: 28800 })
  startTime: number; // in second eg: 01:00:00 am = 3600 in second

  @Column('int', { default: 64800 })
  endTime: number;

  @Column('enum', { enum: DayOfWeek, default: DayOfWeek.sunday })
  dayOfWeek: DayOfWeek;

  @Column()
  orgId: number;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orgId' })
  organization: Organization;
}
