import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Leave } from './entities/leave.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LeavesService {
  constructor(
    @InjectRepository(Leave)
    private readonly leaveRepository: Repository<Leave>,
  ) {}
  create(createLeaveDto: CreateLeaveDto) {
    try {
      const { memberId, ...rest } = createLeaveDto;
      const createLeave = this.leaveRepository.create({
        ...rest,
        member: { id: memberId },
      });
      return this.leaveRepository.save(createLeave);
    } catch (error) {
      throw new ForbiddenException('Error creating leave');
    }
  }

  findAll() {
    return this.leaveRepository.find();
  }

  findOne(id: number) {
    return this.leaveRepository.findOneBy({ id });
  }

  update(id: number, updateLeaveDto: UpdateLeaveDto) {
    return this.leaveRepository.update(id, updateLeaveDto);
  }

  remove(id: number) {
    return this.leaveRepository.delete(id);
  }
}
