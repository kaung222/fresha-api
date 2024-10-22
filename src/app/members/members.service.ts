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
  async create(createMemberDto: CreateMemberDto, orgId: number) {
    const { serviceIds } = createMemberDto;
    const services = await this.serviceService.findByIds(serviceIds);
    const member = this.memberRepository.create({
      ...createMemberDto,
      services,
    });
    return await this.memberRepository.save(member);
  }

  // find many
  async findAll() {
    let page = 1;
    const response = await this.memberRepository.find({
      skip: 10 * (page - 1),
      take: 10,
      order: {
        firstName: 'ASC',
      },
    });
    return response;
  }

  findOne(id: number) {
    return this.memberRepository.findOneBy({ id });
  }

  async update(id: number, updateMemberDto: UpdateMemberDto) {
    const member = await this.memberRepository.findOne({
      where: { id },
      relations: {
        services: true,
      },
    });

    const services = await this.serviceService.findByIds(
      updateMemberDto.serviceIds,
    );
    const updateMember = this.memberRepository.create({
      services,
      ...updateMemberDto,
      id,
    });
    return await this.memberRepository.save(updateMember);
  }

  remove(id: number) {
    return this.memberRepository.softDelete(id);
  }

  restore(id: number) {
    return this.memberRepository.restore(id);
  }

  restoreMany(ids: number[]) {
    return this.memberRepository.restore(ids);
  }

  checkOwnership(memberId: number, userId: number) {
    return this.memberRepository.findOne({
      where: { organization: { id: userId }, id: memberId },
    });
  }
}
