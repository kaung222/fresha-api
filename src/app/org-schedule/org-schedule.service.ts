import { Injectable } from '@nestjs/common';
import { UpdateOrgScheduleDto } from './dto/update-org-schedule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrgSchedule } from './entities/org-schedule.entity';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { defaultScheduleData } from '@/utils/data/org-schedule.data';

@Injectable()
export class OrgScheduleService {
  constructor(
    @InjectRepository(OrgSchedule)
    private orgScheduleRepository: Repository<OrgSchedule>,
  ) {}
  // create schedule for an org
  @OnEvent('organization.created')
  create(orgId: number) {
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

  findAll(orgId: number) {
    return this.orgScheduleRepository.findBy({
      organization: { id: orgId },
    });
  }

  update(id: number, updateOrgScheduleDto: UpdateOrgScheduleDto) {
    const { startTime, endTime } = updateOrgScheduleDto;
    const newSchedule = this.orgScheduleRepository.create({
      startTime,
      endTime,
    });
    return this.orgScheduleRepository.save(newSchedule);
  }

  remove(id: number) {
    return this.orgScheduleRepository.delete(id);
  }
}
