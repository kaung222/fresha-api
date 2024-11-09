import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClosedDayDto } from './dto/create-closed-day.dto';
import { UpdateClosedDayDto } from './dto/update-closed-day.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ClosedDay } from './entities/closed-day.entity';
import { Between, LessThan, MoreThan, Repository } from 'typeorm';
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
    const { startDate, endDate, type, notes } = createClosedDayDto;

    const createClosedDay = this.closedDayRepository.create({
      startDate,
      endDate,
      type,
      notes,
    });
    return this.closedDayRepository.save(createClosedDay);
  }

  // get all close days by org
  async findAll(orgId: number, getClosedDay: GetClosedDay) {
    const { startDate, endDate } = getClosedDay;
    const closedDates = await this.closedDayRepository.findBy({
      organization: { id: orgId },
    });
    return this.formattedClosedDays(closedDates);
  }

  private formattedClosedDays(closedDates: ClosedDay[]) {
    const formattedDays = closedDates.map((closedDay) => {
      const { startDate, endDate, notes, type } = closedDay;
      const days = getDatesBetweenDates(startDate, endDate);
      return days.map((day) => ({
        date: day,
        startDate,
        endDate,
        notes,
        type,
      }));
    });
    return formattedDays;
  }

  async remove(id: number, orgId: number) {
    await this.checkOwnership(id, orgId);
    return this.closedDayRepository.delete(id);
  }

  async checkOwnership(id: number, orgId: number) {
    const closedDay = await this.closedDayRepository.findOneBy({
      id,
      organization: { id: orgId },
    });
    if (!closedDay) throw new NotFoundException('Closed day not found');
    return true;
  }
}
