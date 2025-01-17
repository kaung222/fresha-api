import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { DataSource, In, Repository } from 'typeorm';
import { Roles } from '@/security/user.decorator';
import { Service } from '../services/entities/service.entity';
import { CacheService, CacheTTL } from '@/global/cache.service';
import {
  deleteObjectAWS,
  updateObjectAsUsed,
  updateTagOfObject,
} from '@/utils/store-obj-s3';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    private dataSource: DataSource,
    private readonly cacheService: CacheService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // create new member
  async create(createMemberDto: CreateMemberDto, orgId: number) {
    const { serviceIds, profilePictureUrl, ...rest } = createMemberDto;
    const isExisted = await this.memberRepository.findOneBy({
      email: rest.email,
    });
    if (isExisted) throw new ConflictException('Email already used!');
    const services = await this.getServicesByIds(serviceIds, orgId);
    const createMember = this.memberRepository.create({
      ...rest,
      services,
      organization: { id: orgId },
    });

    const member = await this.memberRepository.save(createMember);
    await updateObjectAsUsed(member?.profilePictureUrl);
    this.eventEmitter.emit('member.created', { memberId: member.id, orgId });
    this.clearCache(orgId);
    return {
      message: 'Create member successfully',
    };
  }

  //  find members of selected services
  findMembers(serviceIds: string[]) {
    return this.dataSource
      .getRepository(Member)
      .createQueryBuilder('member')
      .innerJoin('member.services', 'service') // Join the services relation
      .where('service.id IN (:...serviceIds)', { serviceIds }) // Filter by selected services
      .groupBy('member.id') // Group by member
      .having('COUNT(DISTINCT service.id) = :serviceCount', {
        serviceCount: serviceIds.length,
      }) // Ensure all selected services match
      .getMany();
  }

  async getServicesByIds(serviceIds: number[], orgId: number) {
    const services = await this.dataSource
      .getRepository(Service)
      .findBy({ id: In(serviceIds), orgId });
    if (serviceIds.length !== services.length)
      throw new NotFoundException('Some services are missing');
    return services;
  }

  // find many
  async findAll(orgId: number) {
    const cacheKey = this.getCacheKey(orgId);
    const memberCache = await this.cacheService.get(cacheKey);
    if (memberCache) return memberCache;
    const members = await this.memberRepository
      .createQueryBuilder('member')
      .where('member.orgId=:orgId', { orgId })
      .leftJoin('member.services', 'service')
      .addSelect('service.id')
      .getMany();
    await this.cacheService.set(cacheKey, members, CacheTTL.long);
    return members;
  }

  private getCacheKey(orgId: number) {
    return `${orgId}:members`;
  }

  private clearCache(orgId: number) {
    const cacheKey = this.getCacheKey(orgId);
    return this.cacheService.del(cacheKey);
  }

  // get Member details and services offered
  findOne(id: string) {
    return this.memberRepository.findOne({
      where: { id },
      relations: { services: true },
    });
  }

  // get member detail by access token
  getProfile(id: string) {
    return this.memberRepository.findOneBy({ id });
  }

  async update(id: string, updateMemberDto: UpdateMemberDto, orgId: number) {
    const { serviceIds, profilePictureUrl } = updateMemberDto;
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
    const services = await this.getServicesByIds(serviceIds, orgId);

    // Update the member's services and other fields
    member.services = services;
    Object.assign(member, updateMemberDto);

    // Save the updated member entity
    await this.memberRepository.save(member);
    await updateTagOfObject(orgId, member.profilePictureUrl, profilePictureUrl);
    await this.clearCache(orgId);
    return {
      message: `Update member ${member.firstName} successfully`,
    };
  }

  // get available time slots of a member
  // async getAvailableTimeSlots(memberId: number, getTimes: GetAvailableTimes) {
  //   const { startDate, endDate } = getTimes;
  //   const dates = getDatesBetweenDates(startDate, endDate);
  //   const schedules = await this.dataSource
  //     .getRepository(MemberSchedule)
  //     .findBy({
  //       memberId,
  //     });

  //   const schedule = schedules[0];

  //   dates.map(async (d) => {
  //     const date = new Date(d);

  //     const dayInfo = {
  //       iso: format(date, 'yyyy-MM-dd'),
  //       dayOfMonth: date.getDate(),
  //       formattedDayOfMonth: date.getDate().toString(),
  //       formattedYear: format(date, 'yyyy'),
  //       monthName: format(date, 'MMMM'),
  //       dayName: format(date, 'EEEE'),
  //     };

  //     const leaves = await this.dataSource
  //       .getRepository(Leave)
  //       // @ts-expect-error
  //       .findBy({ member: { id: memberId }, startDate: MoreThan(new Date()) });
  //     const leaveDays = leaves.map(({ startDate, endDate }) =>
  //       getDatesBetweenDates(startDate, endDate),
  //     );

  //     const isMemberLeave = leaveDays[0].includes(d);

  //     // const checkIsPublicHoliday = await this.dataSource.getRepository(ClosedDay).findOneBy({organization: {id: orgId}})

  //     // Check if the day is marked as a business off day or leave
  //     // if (!schedule || isMemberLeave) {
  //     //   return {
  //     //     day: dayInfo,
  //     //     slots: [], // Empty slots array for non-working days
  //     //     message: 'Member is not available',
  //     //   };
  //     // }

  //     const slots = [];
  //     const slotInterval = 1800; // 30 minutes in seconds
  //     let slotTime = schedule.startTime;

  //     while (slotTime < schedule.endTime) {
  //       const startTimeInSeconds = slotTime;
  //       const formattedTime = format(new Date(slotTime * 1000), 'HH:mm');

  //       // Check if the current slot is overlapping with any appointment
  //       const isBooked = appointments.some(
  //         (appointment) =>
  //           startTimeInSeconds >= appointment.startTime &&
  //           startTimeInSeconds < appointment.endTime,
  //       );

  //       if (!isBooked) {
  //         slots.push({
  //           startTimeInSeconds,
  //           formattedTime,
  //           formattedRetailPrice: null,
  //           formattedNonDiscountedPrice: null,
  //           formattedDiscountInfo: null,
  //           isHighDemanded: false,
  //         });
  //       }

  //       // Move to the next slot
  //       slotTime += slotInterval;
  //     }

  //     return {
  //       day: dayInfo,
  //       slots,
  //     };
  //   });
  // }

  async remove(id: string, orgId: number) {
    const { profilePictureUrl } = await this.getMemberById(id, orgId);
    await this.memberRepository.delete({ id });
    this.clearCache(orgId),
      // if image exist then delete
      await deleteObjectAWS(orgId, profilePictureUrl);
    return {
      message: 'Delete member successfully',
    };
  }

  restore(id: string) {
    return this.memberRepository.restore(id);
  }

  restoreMany(ids: number[]) {
    return this.memberRepository.restore(ids);
  }

  async getMemberById(memberId: string, orgId: number): Promise<Member> {
    const member = await this.memberRepository.findOne({
      where: { orgId, id: memberId },
    });
    if (!member) throw new NotFoundException('Member not found');
    if (member.role === Roles.org) {
      throw new ForbiddenException('this account cannot be deleted');
    }
    return member;
  }
}
