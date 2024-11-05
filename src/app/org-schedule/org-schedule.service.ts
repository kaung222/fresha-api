import { Injectable } from '@nestjs/common';
import { CreateOrgScheduleDto } from './dto/create-org-schedule.dto';
import { UpdateOrgScheduleDto } from './dto/update-org-schedule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrgSchedule } from './entities/org-schedule.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrgScheduleService {
  constructor(
    @InjectRepository(OrgSchedule)
    private orgScheduleRepository: Repository<OrgSchedule>,
  ) {}
  create(orgId: number, createOrgScheduleDto: CreateOrgScheduleDto) {
    const { monday, thursday, wednesday, tuesday, friday, saturday, sunday } =
      createOrgScheduleDto;
    const createSchedule = this.orgScheduleRepository.create({
      organization: { id: orgId },
      monday: this.formatObjToString(monday),
      thursday: this.formatObjToString(thursday),
      tuesday: this.formatObjToString(tuesday),
      wednesday: this.formatObjToString(wednesday),
      friday: this.formatObjToString(friday),
      saturday: this.formatObjToString(saturday),
      sunday: this.formatObjToString(sunday),
    });
    console.log(orgId, createSchedule);
    return this.orgScheduleRepository.save(createSchedule);
  }

  formatObjToString(payload: any) {
    //  return JSON.stringify(payload)
    return payload;
  }

  findAll(orgId: number) {
    return this.orgScheduleRepository.findOneBy({
      organization: { id: orgId },
    });
  }

  update(id: number, updateOrgScheduleDto: UpdateOrgScheduleDto) {
    const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } =
      updateOrgScheduleDto;
    const newSchedule = this.orgScheduleRepository.create({
      id,

      monday: this.formatObjToString(monday),
      thursday: this.formatObjToString(thursday),
      tuesday: this.formatObjToString(tuesday),
      wednesday: this.formatObjToString(wednesday),
      friday: this.formatObjToString(friday),
      saturday: this.formatObjToString(saturday),
      sunday: this.formatObjToString(sunday),
    });
    return this.orgScheduleRepository.save(newSchedule);
  }

  remove(id: number) {
    return this.orgScheduleRepository.delete(id);
  }
}
