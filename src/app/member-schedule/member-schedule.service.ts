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
import { CacheService, CacheTTL } from '@/global/cache.service';

@Injectable()
export class MemberScheduleService {
  constructor(
    @InjectRepository(MemberSchedule)
    private readonly memberScheduleRepository: Repository<MemberSchedule>,
    @InjectRepository(BreakTime)
    private breakTimeRepository: Repository<BreakTime>,
    private dataSource: DataSource,
    private cacheService: CacheService,
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
    await this.memberScheduleRepository.save(createSchedule);
    // invalidate cache
    this.cacheService.del(this.getCacheKey(orgId));
    return { message: 'Create schedule successfully' };
  }

  async create(createSchedule: CreateMemberScheduleDto, orgId: number) {
    await this.getMemberById(createSchedule.memberId, orgId);
    const newschedule = this.memberScheduleRepository.create(createSchedule);
    return this.memberScheduleRepository.save(newschedule);
  }

  async findAll(orgId: number) {
    const cacheKey = this.getCacheKey(orgId);
    const dataInCache = await this.cacheService.get(cacheKey);
    if (dataInCache) return dataInCache;
    const response = await this.dataSource.getRepository(Member).find({
      relations: { schedules: true },
      where: {
        orgId,
      },
    });
    await this.cacheService.set(cacheKey, response, CacheTTL.veryLong);
    return response;
  }

  private getCacheKey(orgId: number) {
    return `schedule:${orgId}`;
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

  async update(
    id: string,
    updateMemberScheduleDto: UpdateMemberScheduleDto,
    orgId: number,
  ) {
    const { startTime, endTime } = updateMemberScheduleDto;
    await this.memberScheduleRepository.update(id, { startTime, endTime });
    // invalidate cache
    this.cacheService.del(this.getCacheKey(orgId));
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
    await this.memberScheduleRepository.save(createSchedule);
    // invalidate cache
    await this.cacheService.del(this.getCacheKey(orgId));
    return { message: 'Update schedule successfully' };
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
    // invalidate cache
    this.cacheService.del(this.getCacheKey(orgId));
    return this.memberScheduleRepository.delete({ id });
  }
}
