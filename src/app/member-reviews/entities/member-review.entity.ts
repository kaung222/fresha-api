import { Member } from '@/app/members/entities/member.entity';
import { User } from '@/app/users/entities/user.entity';
import { Column, ManyToOne } from 'typeorm';

export class MemberReview {
  @Column({ type: 'float' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Member, {
    onDelete: 'CASCADE',
  })
  member: Member;
}
