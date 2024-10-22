// Example of entity definition
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class OTP {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  otp: string;

  @Column({ default: false })
  isConfirmed: boolean;

  @Column()
  expiredAt: string;

  @Column({ nullable: true, unique: true })
  userId: string;

  @Column({ nullable: true, unique: true })
  email: string;
}
