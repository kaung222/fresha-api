import { ForbiddenException, Injectable } from '@nestjs/common';
import { UpdateOrgScheduleDto } from './dto/update-org-schedule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrgSchedule } from './entities/org-schedule.entity';
import { In, Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { defaultScheduleData } from '@/utils/data/org-schedule.data';
import { UpdateMultiScheduleDto } from './dto/update-many.dto';
import { CreateOrgScheduleDto } from './dto/create-org-schedule.dto';

@Injectable()
export class OrgScheduleService {
  constructor(
    @InjectRepository(OrgSchedule)
    private orgScheduleRepository: Repository<OrgSchedule>,
  ) {}
  // create schedule for an org
  @OnEvent('organization.created')
  createMany(orgId: number) {
    const createSchedule = this.orgScheduleRepository.create(
      defaultScheduleData.map(({ startTime, endTime, dayOfWeek }) => ({
        organization: { id: orgId },
        startTime,
        endTime,
        dayOfWeek,
      })),
    );

    this.orgScheduleRepository.save(createSchedule);
  }

  async create(createOrgSchedule: CreateOrgScheduleDto, orgId: number) {
    const { startTime, endTime, dayOfWeek } = createOrgSchedule;
    const isExisted = await this.orgScheduleRepository.findOneBy({
      organization: { id: orgId },
      dayOfWeek,
    });
    if (isExisted) throw new ForbiddenException('Schedule already existed');
    const createSchedule = this.orgScheduleRepository.create({
      startTime,
      endTime,
      dayOfWeek,
      organization: { id: orgId },
    });
    return this.orgScheduleRepository.save(createSchedule);
  }

  findAll(orgId: number) {
    return this.orgScheduleRepository.findBy({
      organization: { id: orgId },
    });
  }

  update(id: number, updateOrgScheduleDto: UpdateOrgScheduleDto) {
    const { startTime, endTime } = updateOrgScheduleDto;
    const newSchedule = this.orgScheduleRepository.create({
      id,
      startTime,
      endTime,
    });
    return this.orgScheduleRepository.save(newSchedule);
  }

  async updateMany(
    orgId: number,
    updateMultiScheduleDto: UpdateMultiScheduleDto,
  ) {
    const { schedules } = updateMultiScheduleDto;
    const ids = schedules.map((schedule) => schedule?.id);
    await this.checkOwnership(ids, orgId);
    const createSchedule = this.orgScheduleRepository.create(schedules);
    return this.orgScheduleRepository.save(createSchedule);
  }

  async remove(id: number, orgId: number) {
    await this.checkOwnership([id], orgId);
    return this.orgScheduleRepository.delete(id);
  }

  async checkOwnership(ids: number[], orgId: number): Promise<boolean> {
    const schedules = await this.orgScheduleRepository.findBy({
      id: In(ids),
      organization: { id: orgId },
    });
    return schedules.length === ids.length;
  }
}
