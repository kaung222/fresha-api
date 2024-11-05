import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MemberSchedule } from './member-schedule.entity';

@Entity()
export class BreakTime {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  startTime: number;

  @Column('int')
  endTime: number;

  @Column('time')
  formattedStartTime: string;

  @Column('time')
  formattedEndTime: string;

  @Column()
  scheduleId: number;

  @ManyToOne(() => MemberSchedule, { onDelete: 'CASCADE' })
  memberSchedule: MemberSchedule;
}
