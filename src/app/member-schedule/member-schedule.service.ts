import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMemberScheduleDto } from './dto/create-member-schedule.dto';
import { UpdateMemberScheduleDto } from './dto/update-member-schedule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberSchedule } from './entities/member-schedule.entity';
import { DataSource, In, Repository } from 'typeorm';
import { CreateBreakTimeDto } from './dto/create-breakTime.dto';
import { BreakTime } from './entities/break-time.entity';
import { formatSecondsToTime } from '@/utils';
import { Member } from '../members/entities/member.entity';

@Injectable()
export class MemberScheduleService {
  constructor(
    @InjectRepository(MemberSchedule)
    private readonly memberScheduleRepository: Repository<MemberSchedule>,
    @InjectRepository(BreakTime)
    private breakTimeRepository: Repository<BreakTime>,
    private dataSource: DataSource,
  ) {}
  // create schedule for a member
  async create(
    createMemberScheduleDto: CreateMemberScheduleDto,
    orgId: number,
  ) {
    const { memberId, memberSchedules } = createMemberScheduleDto;
    const member = await this.dataSource
      .getRepository(Member)
      .findOneBy({ id: memberId, organization: { id: orgId } });
    if (!member) throw new NotFoundException('Member not found');
    const createSchedule = this.memberScheduleRepository.create(
      memberSchedules.map(({ startTime, endTime, dayOfWeek }) => ({
        startTime,
        endTime,
        dayOfWeek,
        member,
      })),
    );
    return this.memberScheduleRepository.save(createSchedule);
  }

  async createMany() {}

  async findAll(orgId: number) {
    const members = await this.dataSource
      .getRepository(Member)
      .find({ where: { organization: { id: orgId } } });
    const memberIds = members.map((member) => member.id);
    return this.memberScheduleRepository.findBy({
      memberId: In(memberIds),
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} memberSchedule`;
  }

  // add  breaktimes to a schedule
  async createBreakTime(
    scheduleId: number,
    createBreakTime: CreateBreakTimeDto,
  ) {
    const newBreakTime = this.breakTimeRepository.create(
      createBreakTime.breakTimes.map(({ startTime, endTime }) => ({
        scheduleId,
        startTime,
        endTime,
      })),
    );
    return await this.breakTimeRepository.save(newBreakTime);
  }

  async update(id: number, updateMemberScheduleDto: UpdateMemberScheduleDto) {
    const { startTime, endTime } = updateMemberScheduleDto;
    await this.memberScheduleRepository.update(id, { startTime, endTime });
    return {
      message: 'Updated the schedule successfully',
    };
  }

  async remove(id: number) {
    await this.memberScheduleRepository.delete(id);
    return {
      message: 'Deleted the schedule successfully',
    };
  }
}
