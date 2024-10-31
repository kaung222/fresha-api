import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { DataSource, Repository } from 'typeorm';
import { ServicesService } from '../services/services.service';
import { Roles } from '@/security/user.decorator';

@Injectable()
export class MembersService {
  constructor(
    private readonly serviceService: ServicesService,
    private dataSource: DataSource,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  // create new member
  async create(createMemberDto: CreateMemberDto, orgId: number) {
    const { serviceIds, ...rest } = createMemberDto;
    const member = this.memberRepository.create({
      ...rest,
      services: serviceIds?.map((id) => ({ id })),
      organization: { id: orgId },
    });
    return await this.memberRepository.save(member);
  }

  // find many
  async findAll(orgId: number) {
    let page = 1;
    const response = await this.memberRepository.find({
      skip: 10 * (page - 1),
      take: 10,
      order: {
        firstName: 'ASC',
      },
      where: {
        organization: { id: orgId },
      },
    });
    return response;
  }

  findOne(id: number) {
    return this.memberRepository.findOne({
      where: { id },
      relations: { services: true },
    });
  }

  getProfile(id: number) {
    return this.memberRepository.findOneBy({ id });
  }

  async update(id: number, updateMemberDto: UpdateMemberDto) {
    // Find the member with the relations (services)
    const member = await this.memberRepository.findOne({
      where: { id },
      relations: {
        services: true,
      },
    });

    // Handle the case where the member does not exist
    if (!member) {
      throw new NotFoundException(`Member with ID ${id} not found`);
    }

    // Fetch the services based on the provided service IDs
    const services = await this.serviceService.findByIds(
      updateMemberDto.serviceIds,
    );

    // Update the member's services and other fields
    member.services = services;
    Object.assign(member, updateMemberDto);

    // Save the updated member entity
    return await this.memberRepository.save(member);
  }

  remove(id: number) {
    return this.memberRepository.delete(id);
  }

  restore(id: number) {
    return this.memberRepository.restore(id);
  }

  restoreMany(ids: number[]) {
    return this.memberRepository.restore(ids);
  }

  async checkOwnership(memberId: number, userId: number): Promise<Member> {
    const member = await this.memberRepository.findOne({
      where: { organization: { id: userId }, id: memberId },
    });
    if (member.role === Roles.org) {
      throw new ForbiddenException('this account cannot be deleted');
    }
    return member;
  }
}
