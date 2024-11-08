import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMemberScheduleDto } from './dto/create-member-schedule.dto';
import { UpdateMemberScheduleDto } from './dto/update-member-schedule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberSchedule } from './entities/member-schedule.entity';
import { DataSource, In, Repository } from 'typeorm';
import { CreateBreakTimeDto } from './dto/create-breakTime.dto';
import { BreakTime } from './entities/break-time.entity';
import { OnEvent } from '@nestjs/event-emitter';
import { defaultScheduleData } from '@/utils/data/org-schedule.data';
import { UpdateMultiScheduleDto } from './dto/create-many.dto';

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
  @OnEvent('member.created')
  async createMany({ memberId, orgId }: { memberId: number; orgId: number }) {
    const schedules = defaultScheduleData;
    const createSchedule = this.memberScheduleRepository.create(
      schedules.map(({ startTime, endTime, dayOfWeek }) => ({
        startTime,
        endTime,
        dayOfWeek,
        member: { id: memberId },
        organization: { id: orgId },
      })),
    );
    return this.memberScheduleRepository.save(createSchedule);
  }

  async create(createSchedule: CreateMemberScheduleDto, orgId: number) {
    const { startTime, endTime, memberId, dayOfWeek } = createSchedule;
    const isExisted = await this.memberScheduleRepository.findOneBy({
      memberId,
      dayOfWeek,
    });
    if (isExisted) throw new ForbiddenException('Schedule already existed');
    const newschedule = this.memberScheduleRepository.create({
      startTime,
      endTime,
      dayOfWeek,
      memberId,
      organization: { id: orgId },
    });
    return this.memberScheduleRepository.save(newschedule);
  }

  async findAll(orgId: number) {
    return this.memberScheduleRepository.findBy({
      organization: { id: orgId },
    });
  }

  findOne(id: number) {
    return this.memberScheduleRepository.findOneBy({ id });
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

  async updateMany(
    orgId: number,
    updateMultiScheduleDto: UpdateMultiScheduleDto,
  ) {
    const { schedules, memberId } = updateMultiScheduleDto;
    await this.memberScheduleRepository.delete({
      memberId: memberId,
      organization: { id: orgId },
    });
    const createSchedule = this.memberScheduleRepository.create(schedules);
    return this.memberScheduleRepository.save(createSchedule);
  }

  async checkOwnership(ids: number[], orgId: number): Promise<boolean> {
    const schedules = await this.memberScheduleRepository.find({
      where: { id: In(ids), organization: { id: orgId } },
    });
    return schedules.length === ids.length;
  }

  async remove(id: number) {
    await this.memberScheduleRepository.delete(id);
    return {
      message: 'Deleted the schedule successfully',
    };
  }
}
