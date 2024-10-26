import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment, BookingStatus } from './entities/appointment.entity';
import { Repository } from 'typeorm';
import { BookingItem } from './entities/booking-item.entity';
import { PaginateQuery } from '@/utils/paginate-query.dto';
import { PaginationResponse } from '@/utils/paginate-res.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(BookingItem)
    private readonly bookingItemRepository: Repository<BookingItem>,
  ) {}
  async create(createAppointmentDto: CreateAppointmentDto, userId: number) {
    const { bookingItems, orgId, ...rest } = createAppointmentDto;
    const createAppointment = this.appointmentRepository.create({
      ...rest,
      user: { id: userId },
    });
    const appointment =
      await this.appointmentRepository.save(createAppointment);
    const createAppointmentItems = this.bookingItemRepository.create(
      bookingItems.map((item) => {
        return {
          member: { id: item.memberId },
          service: { id: item.serviceId },
          appointment: { id: appointment.id },
        };
      }),
    );
    await this.bookingItemRepository.save(createAppointmentItems);
    return 'This action adds a new appointment';
  }

  async findAll(orgId: number, paginateQuery: PaginateQuery) {
    const { page } = paginateQuery;
    const [data, totalCount] = await this.appointmentRepository.findAndCount({
      where: { organization: { id: orgId } },
      take: 10,
      skip: 10 * (page - 1),
      order: { createdAt: 'ASC' },
    });
    return new PaginationResponse({ data, page, totalCount }).toResponse();
  }

  findOne(id: number) {
    return this.appointmentRepository.findOne({
      where: { id },
      relations: {
        bookingItems: true,
        user: true,
      },
    });
  }

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    const { bookingItems, ...rest } = updateAppointmentDto;
    const appointment = await this.appointmentRepository.findOne({
      relations: { user: true },
    });
    if (!appointment) throw new NotFoundException('appointment not found');
    if (!appointment.user)
      throw new ForbiddenException("This item can't not be updated");
    const createAppointmentItems = this.bookingItemRepository.create(
      bookingItems.map((item) => {
        return {
          member: { id: item.memberId },
          service: { id: item.serviceId },
          appointment: { id: appointment.id },
        };
      }),
    );
    const items = await this.bookingItemRepository.save(createAppointmentItems);
    appointment.bookingItems = items;
    Object.assign(appointment, rest);
    return await this.appointmentRepository.save(appointment);
  }

  confirmBooking(id: number) {
    this.appointmentRepository.update(id, { status: BookingStatus.confirmed });
    return {
      message: 'Confirm booking succesfully',
    };
  }

  cancelBooking(id: number) {
    this.appointmentRepository.update(id, { status: BookingStatus.cancelled });
    return {
      message: 'Cancel booking succesfully',
    };
  }

  completeBooking(id: number) {
    this.appointmentRepository.update(id, { status: BookingStatus.completed });
    return {
      message: 'Marked as omplete booking succesfully',
    };
  }

  remove(id: number) {
    this.appointmentRepository.delete(id);
    return {
      message: 'Delete booking succesfully',
    };
  }

  async checkOwnership(id: number, orgId: number) {
    const appointment = await this.appointmentRepository.findOneBy({
      organization: { id: orgId },
      id,
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return true;
  }
}
