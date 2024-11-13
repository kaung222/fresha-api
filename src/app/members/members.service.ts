import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { DataSource, In, Repository } from 'typeorm';
import { ServicesService } from '../services/services.service';
import { Roles } from '@/security/user.decorator';
import { format } from 'date-fns';
import { getCurrentDate, getCurrentDayOfWeek } from '@/utils';
import {
  MemberSchedule,
  ScheduleType,
} from '../member-schedule/entities/member-schedule.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Service } from '../services/entities/service.entity';
import { GetAvailableTimes } from './dto/get-available-time.dto';
import { CreateNotificationDto } from '../notifications/dto/create-notification.dto';

@Injectable()
export class MembersService {
  constructor(
    private eventEmitter: EventEmitter2,
    private dataSource: DataSource,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
  ) {}

  async memberCreateEvent(orgId: number, member: Member) {
    this.eventEmitter.emit('member.created', { memberId: member.id, orgId });
    // create notification for owner org
    const notification: CreateNotificationDto = {
      body: 'New member created and send invitation email',
      title: 'Member created',
      type: 'Member',
      userId: orgId,
      link: member.id.toString(),
      thumbnail: member?.profilePictureUrl,
    };
    this.eventEmitter.emit('notification.created', notification);
    // file update as used
    this.eventEmitter.emit('files.used', {
      ids: [member.profilePictureUrl],
    });
  }
  // create new member
  async create(createMemberDto: CreateMemberDto, orgId: number) {
    const { serviceIds, ...rest } = createMemberDto;
    const createMember = this.memberRepository.create({
      ...rest,
      services: serviceIds?.map((id) => ({ id })),
      organization: { id: orgId },
    });
    const member = await this.memberRepository.save(createMember);
    this.memberCreateEvent(orgId, member);
    return {
      message: 'Create member successfully',
    };
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
    const services = await this.dataSource
      .getRepository(Service)
      .findBy({ id: In(serviceIds) });

    // Update the member's services and other fields
    member.services = services;
    Object.assign(member, updateMemberDto);

    // Save the updated member entity
    await this.memberRepository.save(member);
    this.eventEmitter.emit('files.used', { ids: [profilePictureUrl] });
    this.eventEmitter.emit('files.unused', { ids: [member.profilePictureUrl] });
    return {
      message: 'success',
    };
  }

  // get available time slots of a member
  async getAvailableTimeSlots(memberId: number, getTimes: GetAvailableTimes) {
    // Fetch member's schedule for the given day of the week
    // const {startDate,endDate} = getTimes
    const currentDate = getCurrentDate();
    const date = new Date(currentDate);
    const schedule = await this.dataSource
      .getRepository(MemberSchedule)
      .findOneBy({
        member: { id: memberId },
        dayOfWeek: getCurrentDayOfWeek(currentDate),
      });

    const dayInfo = {
      iso: format(date, 'yyyy-MM-dd'),
      dayOfMonth: date.getDate(),
      formattedDayOfMonth: date.getDate().toString(),
      formattedYear: format(date, 'yyyy'),
      monthName: format(date, 'MMMM'),
      dayName: format(date, 'EEEE'),
    };

    // Check if the day is marked as a business off day or leave
    if (!schedule) {
      return {
        day: dayInfo,
        slots: [], // Empty slots array for non-working days
        message: 'Member is not available',
      };
    }
    // Fetch existing appointments for the member on the specified date
    const appointments = await this.dataSource
      .getRepository(Appointment)
      .findBy({
        member: { id: memberId },
        date: currentDate,
      });

    const slots = [];
    const slotInterval = 1800; // 30 minutes in seconds
    let slotTime = schedule.startTime;

    while (slotTime < schedule.endTime) {
      const startTimeInSeconds = slotTime;
      const formattedTime = format(new Date(slotTime * 1000), 'HH:mm');

      // Check if the current slot is overlapping with any appointment
      const isBooked = appointments.some(
        (appointment) =>
          startTimeInSeconds >= appointment.startTime &&
          startTimeInSeconds < appointment.endTime,
      );

      if (!isBooked) {
        slots.push({
          startTimeInSeconds,
          formattedTime,
          formattedRetailPrice: null,
          formattedNonDiscountedPrice: null,
          formattedDiscountInfo: null,
          isHighDemanded: false,
        });
      }

      // Move to the next slot
      slotTime += slotInterval;
    }

    return {
      day: dayInfo,
      slots,
    };
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
