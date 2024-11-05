import { Member } from '@/app/members/entities/member.entity';
import { Organization } from '@/app/organizations/entities/organization.entity';
import { IncrementEntity, UUIDEntity } from '@/utils';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BreakTime } from './break-time.entity';

export enum DayOfWeek {
  monday = 'Monday',
  tuesday = 'Tuesday',
  wednesday = 'Wednesday',
  thursday = 'Thursday',
  friday = 'Friday',
  satuarday = 'Satuarday',
  sunday = 'Sunday',
}

export enum ScheduleType {
  businessOffday = 'Business Off Day',
  training = 'Training',
  leave = 'Leave',
  workingDay = 'Working Day',
}
@Entity()
export class MemberSchedule {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  startTime: number; // in second eg: 01:00:00 am = 3600 in second

  @Column()
  endTime: number; // in second

  @Column('enum', { enum: DayOfWeek, default: DayOfWeek.monday })
  dayOfWeek: DayOfWeek;

  @Column()
  memberId: number;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'memberId' })
  member: Member;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization: Organization;

  @OneToMany(() => BreakTime, (breakTime) => breakTime.memberSchedule)
  breakTimes: BreakTime[];
}
