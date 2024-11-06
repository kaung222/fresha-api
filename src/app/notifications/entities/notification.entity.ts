import { IncrementEntity } from '@/utils';
import { Entity, Column } from 'typeorm';

@Entity()
export class Notification extends IncrementEntity {
  @Column()
  title: string;

  @Column()
  userId: number;

  @Column({ nullable: true })
  thumbnail: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ nullable: true })
  link: string;

  @Column({ default: false })
  isRead: boolean;
}
