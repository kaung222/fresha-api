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
import { UpdateMultiScheduleDto } from './dto/update-many.dto';
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
  @OnEvent('member.created')
  async createMany({ memberId, orgId }: { memberId: string; orgId: number }) {
    await this.getMemberById(memberId, orgId);
    const schedules = defaultScheduleData;
    const createSchedule = this.memberScheduleRepository.create(
      schedules.map(({ startTime, endTime, dayOfWeek }) => ({
        startTime,
        endTime,
        dayOfWeek,
        member: { id: memberId },
      })),
    );
    return this.memberScheduleRepository.save(createSchedule);
  }

  async create(createSchedule: CreateMemberScheduleDto, orgId: number) {
    await this.getMemberById(createSchedule.memberId, orgId);
    const newschedule = this.memberScheduleRepository.create(createSchedule);
    return this.memberScheduleRepository.save(newschedule);
  }

  async findAll(orgId: number) {
    return this.dataSource.getRepository(Member).find({
      relations: { schedules: true },
      where: {
        orgId,
      },
    });
  }

  getMemberSchedule(memberId: string) {
    return this.memberScheduleRepository.findBy({ memberId });
  }

  findOne(id: string) {
    return this.memberScheduleRepository.findOneBy({ id });
  }

  // add  breaktimes to a schedule
  async createBreakTime(
    scheduleId: string,
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

  async update(id: string, updateMemberScheduleDto: UpdateMemberScheduleDto) {
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
    await this.getMemberById(memberId, orgId);
    await this.memberScheduleRepository.delete({
      memberId: memberId,
    });
    const createSchedule = this.memberScheduleRepository.create(
      schedules.map(({ startTime, endTime, dayOfWeek }) => ({
        startTime,
        endTime,
        dayOfWeek,
        organization: { id: orgId },
        memberId,
      })),
    );
    return this.memberScheduleRepository.save(createSchedule);
  }

  async getMemberById(memberId: string, orgId: number) {
    const member = await this.dataSource
      .getRepository(Member)
      .findOneBy({ id: memberId, orgId });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  async removeSchedule(id: string, orgId: number) {
    const schedule = await this.memberScheduleRepository.findOneBy({ id });
    await this.getMemberById(schedule.memberId, orgId);
    return this.memberScheduleRepository.delete({ id });
  }
}
