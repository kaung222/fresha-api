import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { IncrementEntity } from '@/utils/base.entity';
import { Service } from '@/app/services/entities/service.entity';
import { Organization } from '@/app/organizations/entities/organization.entity';
import { Roles } from '@/security/user.decorator';

export enum Gender {
  male = 'male',
  female = 'female',
}

export enum MemberRole {
  org = 'organization',
  member = 'member',
}

export enum MemberType {
  employee = 'employee',
  self_employed = 'self-employed',
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
  profilePictureUrl: string;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
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

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization: Organization;

  @Column({ enum: MemberType, default: MemberType.employee })
  type: MemberType;

  // rating
  @Column('float', { default: 0, nullable: true })
  averageRating: number;

  @Column({ nullable: true, select: false })
  password: string;

  @Column({ enum: Roles, default: Roles.member })
  role: Roles;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  country: string;

  //   @OneToMany(() => Review, (review) => review.doctor)
  //   reviews: Review[];
}
