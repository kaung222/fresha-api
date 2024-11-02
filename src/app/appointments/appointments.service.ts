import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment, BookingStatus } from './entities/appointment.entity';
import { Between, DataSource, Equal, In, MoreThan, Repository } from 'typeorm';
import { PaginateQuery } from '@/utils/paginate-query.dto';
import { PaginationResponse } from '@/utils/paginate-res.dto';
import { ServiceAppointment } from './entities/serviceappointment.entity';
import { GetAppointmentDto } from './dto/get-appointment.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Service } from '../services/entities/service.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(ServiceAppointment)
    private readonly serviceAppointmentRepository: Repository<ServiceAppointment>,
  ) {}

  // create new appointment by user
  async create(createAppointmentDto: CreateAppointmentDto, userId: number) {
    const { serviceIds, memberId, orgId, start, ...rest } =
      createAppointmentDto;

    const services = await this.dataSource
      .getRepository(Service)
      .findBy({ id: In(serviceIds) });
    if (!services) throw new NotFoundException('service not found');
    const totalTime = services.reduce((pv, cv) => pv + cv.duration, 0);
    const totalPrice = services.reduce((pv, cv) => pv + cv.price, 0);
    const createAppointment = this.appointmentRepository.create({
      ...rest,
      user: { id: userId },
      organization: { id: orgId },
      member: { id: memberId },
      end: start + totalTime,
      start: start,
      totalTime,
      totalPrice,
    });
    const appointment =
      await this.appointmentRepository.save(createAppointment);
    const createAppointmentItems = this.serviceAppointmentRepository.create(
      services.map((service) => ({
        service,
        appointment,
      })),
    );
    await this.serviceAppointmentRepository.save(createAppointmentItems);
    // emit an event to create a client
    return {
      message: 'Book an appointment successfully',
    };
  }

  async findAll(orgId: number, getAppointmentDto: GetAppointmentDto) {
    const { date } = getAppointmentDto;
    const data = await this.appointmentRepository.find({
      where: { organization: { id: orgId }, date },
    });
    return data;
  }

  findOne(id: number) {
    return this.appointmentRepository.findOne({
      where: { id },
      relations: {
        client: true,
      },
    });
  }

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    const { serviceIds, start, ...rest } = updateAppointmentDto;
    const appointment = await this.appointmentRepository.findOne({
      relations: { client: true, user: true },
      where: { id },
    });
    if (!appointment) throw new NotFoundException('appointment not found');
    if (!appointment.client)
      throw new ForbiddenException("This item can't not be updated");
    if (serviceIds) {
      const services = await this.dataSource
        .getRepository(Service)
        .findBy({ id: In(serviceIds) });
      if (!services) throw new NotFoundException('service not found');
      const createAppointmentItems = this.serviceAppointmentRepository.create(
        services?.map((service) => ({
          service,
          appointment: { id: id },
        })),
      );
      const bookingItems = await this.serviceAppointmentRepository.save(
        createAppointmentItems,
      );
      const totalTime = services.reduce((pv, cv) => pv + cv.duration, 0);
      appointment.bookingItems = bookingItems;
      appointment.totalPrice = services.reduce((pv, cv) => pv + cv.price, 0);
      appointment.totalTime = totalTime;
      appointment.end = start + totalTime;
      appointment.start = start;
    }
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
