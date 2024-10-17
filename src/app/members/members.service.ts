import { Injectable } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { Repository } from 'typeorm';
import { ServicesService } from '../services/services.service';

@Injectable()
export class MembersService {
  constructor(
    private readonly serviceService: ServicesService,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  // create new service
  async create(createMemberDto: CreateMemberDto) {
    const { serviceIds } = createMemberDto;
    const services = await this.serviceService.findByIds(serviceIds);
    const member = this.memberRepository.create({
      ...createMemberDto,
      services,
    });
    return await this.memberRepository.save(member);
  }

  // find many
  findAll() {
    return this.memberRepository.find();
  }

  // find by email to check if exist
  findByEmail(email: string) {
    return this.memberRepository.findOneBy({ email });
  }

  findOne(id: number) {
    return this.memberRepository.findOneBy({ id });
  }

  update(id: number, updateMemberDto: UpdateMemberDto) {
    return `This action updates a #${id} member`;
  }

  remove(id: number) {
    return this.memberRepository.softDelete(id);
  }

  checkOwnership(serviceId: number, userId: number) {
    return this.memberRepository.findOne({
      where: { organization: { id: userId }, id: serviceId },
    });
  }
}
