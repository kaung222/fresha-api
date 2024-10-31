import { UUIDEntity } from '@/utils';
import { Column, Entity } from 'typeorm';

@Entity()
export class Test extends UUIDEntity {
  @Column()
  name: string;
}

const res = {
  date: '24-30-10',
  memberschedule: [
    { memberId: 1, startTime: '08:00:00', endTime: '16:00:00' },
    { memberId: 2, startTime: '08:00:00', endTime: '16:00:00' },
  ],
  blockTime: [
    {
      memberId: 2,
      startTime: '02:00:00',
      endTime: '02:30:00',
    },
  ],
  bookings: [
    {
      id: 1,
      firstName: 'James',
      service: 'Services Array',
      date: '24-30-10',
      time: '17:00:00',
    },
  ],
};

enum TimeType {
  working = 'working',
  leave = 'leave',
  holidays = 'holidays',
  other = 'other',
}

enum Day {
  monday = 'Monday',
  tuesday = 'Tuesday',
  wednesday = 'Wednesday',
  thursday = 'Thursday',
  friday = 'Friday',
  satuarday = 'Satuarday',
  sunday = 'Sunday',
}
class Time {
  startTime: string;
  endTime: string;
  type: TimeType;
  notes: string;
  title: string;
  isAvailable: boolean;
  memberId: number;
  day: Day;
  isRegular: boolean;
}
