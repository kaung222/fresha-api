import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { IncrementEntity } from '@/utils/base.entity';
import { Service } from '@/app/services/entities/service.entity';
import { Organization } from '@/app/organizations/entities/organization.entity';

export enum Gender {
  male = 'male',
  female = 'female',
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

  @Column({ nullable: true, default: 'employee' })
  type: 'employee' | 'self-employed';

  // rating
  @Column('float', { default: 0, nullable: true })
  averageRating: number;

  @Column({ nullable: true, select: false })
  password: string;

  @Column({ default: 'member' })
  role: 'member' | 'organisation';

  //   @OneToMany(() => Review, (review) => review.doctor)
  //   reviews: Review[];
}
