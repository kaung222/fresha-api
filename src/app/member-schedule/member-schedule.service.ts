import { Injectable } from '@nestjs/common';
import { CreateMemberScheduleDto } from './dto/create-member-schedule.dto';
import { UpdateMemberScheduleDto } from './dto/update-member-schedule.dto';

@Injectable()
export class MemberScheduleService {
  create(createMemberScheduleDto: CreateMemberScheduleDto) {
    return 'This action adds a new memberSchedule';
  }

  findAll() {
    return `This action returns all memberSchedule`;
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
