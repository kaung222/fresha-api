import { IncrementEntity } from '@/utils/base.entity';
import { Column, Entity } from 'typeorm';

export enum Gender {
  male = 'male',
  female = 'female',
  none = 'none',
}

@Entity()
export class User extends IncrementEntity {
  @Column()
  firstName: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  email: string;

  @Column()
  phone: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  profilePicture?: string;

  @Column({ type: 'enum', enum: Gender, default: Gender.none })
  gender?: Gender;

  @Column('date', { nullable: true })
  dob: Date;
}
