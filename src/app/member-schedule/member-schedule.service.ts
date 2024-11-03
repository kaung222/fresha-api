import { Injectable } from '@nestjs/common';
import { CreateMemberScheduleDto } from './dto/create-member-schedule.dto';
import { UpdateMemberScheduleDto } from './dto/update-member-schedule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberSchedule } from './entities/member-schedule.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MemberScheduleService {
  constructor(
    @InjectRepository(MemberSchedule)
    private readonly memberScheduleRepository: Repository<MemberSchedule>,
  ) {}
  // create schedule for a member
  create(createMemberScheduleDto: CreateMemberScheduleDto) {
    const createSchedule = this.memberScheduleRepository.create(
      createMemberScheduleDto,
    );
    return this.memberScheduleRepository.save(createSchedule);
  }

  findAll(orgId: number) {
    return this.memberScheduleRepository.findBy({
      organization: { id: orgId },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} memberSchedule`;
  }

  update(id: number, updateMemberScheduleDto: UpdateMemberScheduleDto) {
    return `This action updates a #${id} memberSchedule`;
  }

  remove(id: number) {
    return `This action removes a #${id} memberSchedule`;
  }
}
