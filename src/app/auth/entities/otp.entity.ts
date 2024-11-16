// Example of entity definition
import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

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

  @Index('OTP_email')
  @Column({ nullable: true, unique: true })
  email: string;
}
