import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClosedDayDto } from './dto/create-closed-day.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ClosedDay } from './entities/closed-day.entity';
import { Repository } from 'typeorm';
import { getDatesBetweenDates } from '@/utils';
import { GetClosedDay } from './dto/get-close-days.dto';

@Injectable()
export class ClosedDaysService {
  constructor(
    @InjectRepository(ClosedDay)
    private closedDayRepository: Repository<ClosedDay>,
  ) {}

  // create closed days
  create(createClosedDayDto: CreateClosedDayDto, orgId: number) {
    const createClosedDay = this.closedDayRepository.create({
      ...createClosedDayDto,
      organization: { id: orgId },
    });
    return this.closedDayRepository.save(createClosedDay);
  }

  // get all close days by org
  async findAll(orgId: number, getClosedDay?: GetClosedDay) {
    return await this.closedDayRepository.findBy({ orgId });
  }

  async getFormattedcloseDay(orgId: number) {
    const closedDates = await this.findAll(orgId);
    return this.formattedClosedDays(closedDates);
  }

  private formattedClosedDays(closedDates: ClosedDay[]) {
    const formattedDays = closedDates.flatMap((closedDay) => {
      const { startDate, endDate } = closedDay;
      const days = getDatesBetweenDates(startDate, endDate);
      return days.map((day) => ({
        date: day,
        ...closedDay,
      }));
    });
    return formattedDays;
  }

  async remove(id: number, orgId: number) {
    await this.getClosedDay(id, orgId);
    return this.closedDayRepository.delete(id);
  }

  async getClosedDay(id: number, orgId: number) {
    const closedDay = await this.closedDayRepository.findOneBy({ id, orgId });
    if (!closedDay) throw new NotFoundException('Closed day not found');
    return closedDay;
  }
}
