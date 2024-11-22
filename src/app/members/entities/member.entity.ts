import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { IncrementEntity } from '@/utils/base.entity';
import { Service } from '@/app/services/entities/service.entity';
import { Organization } from '@/app/organizations/entities/organization.entity';
import { Roles } from '@/security/user.decorator';
import { Gender } from '@/app/users/entities/user.entity';
import { MemberSchedule } from '@/app/member-schedule/entities/member-schedule.entity';

export enum MemberType {
  employee = 'employee',
  self_employed = 'self-employed',
}

export enum CommissionFeesType {
  fixed = 'fixed',
  percent = 'percent',
}

@Entity()
export class Member extends IncrementEntity {
  @Column()
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column('date', { nullable: true })
  dob: Date;

  @Column({ nullable: true })
  profilePictureUrl?: string;

  @Column('enum', {
    enum: Gender,
    default: Gender.none,
  })
  gender: Gender;

  @Column({ nullable: true })
  jobTitle: string;

  @Column({ nullable: true })
  notes: string;

  @Column('date', { nullable: true })
  startDate: Date;

  @Column('int', { nullable: true })
  experience: number;

  @Column('simple-array', { nullable: true })
  languageProficiency: string[];

  @ManyToMany(() => Service, (service) => service.members)
  @JoinTable()
  services: Service[];

  @Column({ nullable: true })
  memberId: string;

  @Column({ type: 'enum', enum: MemberType, default: MemberType.employee })
  type: MemberType;

  // rating
  @Column('float', { default: 0 })
  rating: number;

  @Column('int', { default: 0 })
  ratingCount: number;

  @Column('int', { default: 0 })
  commissionFees: number;

  @Column('enum', {
    enum: CommissionFeesType,
    default: CommissionFeesType.percent,
  })
  commissionFeesType: CommissionFeesType;

  @Column({ nullable: true, select: false })
  password: string;

  @Column({ type: 'enum', enum: Roles, default: Roles.member })
  role: Roles;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  country: string;

  //   @OneToMany(() => Review, (review) => review.doctor)
  //   reviews: Review[];

  @Index('orgId')
  @Column()
  orgId: number;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orgId' })
  organization: Organization;

  @OneToMany(() => MemberSchedule, (schedule) => schedule.member)
  schedules: MemberSchedule[];
}
