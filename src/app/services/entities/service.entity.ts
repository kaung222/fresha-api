import { Member } from '@/app/members/entities/member.entity';
import { IncrementEntity } from '@/utils/base.entity';
import { Entity, Column, ManyToOne, ManyToMany } from 'typeorm';

@Entity()
export class Service extends IncrementEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ default: 'all' })
  gender: 'all' | 'female' | 'male';

  @Column({ nullable: true })
  duration: number; // in minutes

  @ManyToMany(() => Member, (member) => member.services)
  members: Member[];
}
