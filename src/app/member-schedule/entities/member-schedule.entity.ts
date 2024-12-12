import { Member } from '@/app/members/entities/member.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BreakTime } from './break-time.entity';
import { Organization } from '@/app/organizations/entities/organization.entity';

export enum DayOfWeek {
  monday = 'Monday',
  tuesday = 'Tuesday',
  wednesday = 'Wednesday',
  thursday = 'Thursday',
  friday = 'Friday',
  saturday = 'Saturday',
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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  startTime: number; // in second eg: 01:00:00 am = 3600 in second

  @Column()
  endTime: number; // in second

  @Column('enum', { enum: DayOfWeek, default: DayOfWeek.monday })
  dayOfWeek: DayOfWeek;

  @Column()
  memberId: string;

  @ManyToOne(() => Member, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'memberId' })
  member: Member;

  // @OneToMany(() => BreakTime, (breakTime) => breakTime.memberSchedule, {
  //   eager: true,
  // })
  // breakTimes: BreakTime[];
}

export class TimePeriod {
  startTime: number;
  endTime: number;
}
export class OneDayDuty {
  workingHours: TimePeriod;
  breakTimes?: TimePeriod[];
}
