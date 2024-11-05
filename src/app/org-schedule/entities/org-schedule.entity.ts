import { Member } from '@/app/members/entities/member.entity';
import { Organization } from '@/app/organizations/entities/organization.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
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

  @Column('json', { nullable: true })
  monday: OneDayDuty;

  @Column('json', { nullable: true })
  tuesday: OneDayDuty;

  @Column('json', { nullable: true })
  wednesday: OneDayDuty;

  @Column('json', { nullable: true })
  thursday: OneDayDuty;

  @Column('json', { nullable: true })
  friday: OneDayDuty;

  @Column('json', { nullable: true })
  saturday: OneDayDuty;

  @Column('json', { nullable: true })
  sunday: OneDayDuty;

  @OneToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn()
  organization: Organization;
}
