import { Injectable } from '@nestjs/common';
import { DataSource, MoreThan } from 'typeorm';
import { GetTimeSlots } from './dto/get-tiimeSlots.dto';
import { getCurrentDayOfWeek, getDatesBetweenDates } from '@/utils';
import { OrgSchedule } from '../org-schedule/entities/org-schedule.entity';
import { daysToWeeks, format } from 'date-fns';
import { ClosedDay } from '../closed-days/entities/closed-day.entity';

@Injectable()
export class TimeSlotsService {
  constructor(private readonly dataSource: DataSource) {}

  getMemberTimeSlots(memberId: number, getTimeSlots: GetTimeSlots) {
    const { startDate, endDate } = getTimeSlots;
  }

  async getOrgTimeSlots(orgId: number, getTimeSlots: GetTimeSlots) {
    const { startDate, endDate } = getTimeSlots;
    const dates = getDatesBetweenDates(startDate, endDate);
    const orgSchedule = await this.dataSource
      .getRepository(OrgSchedule)
      .findBy({ organization: { id: orgId } });

    // const closedDays = this.dataSource
    //   .getRepository(ClosedDay)
    //   .find({ where: { organization: { id: orgId } ,startDate: MoreThan(new Date())} ,});
  }

  getTimeSlotes(orgSchedules: OrgSchedule[], dates: string[]) {
    return dates.map((d) => {
      const dayInfo = this.getDayInfo(d);
      const dayOfWeek = getCurrentDayOfWeek(d);
      let orgSchedule = orgSchedules.find((day) => day.dayOfWeek === dayOfWeek);
      if (!orgSchedule) {
        return {
          dayInfo,
          timeSlots: [],
          message: 'Organization closed day',
        };
      }
    });
  }

  getDayInfo(d: string) {
    const date = new Date(d);
    return {
      iso: format(date, 'yyyy-MM-dd'),
      dayOfMonth: date.getDate(),
      formattedDayOfMonth: date.getDate().toString(),
      formattedYear: format(date, 'yyyy'),
      monthName: format(date, 'MMMM'),
      dayName: format(date, 'EEEE'),
    };
  }
}
