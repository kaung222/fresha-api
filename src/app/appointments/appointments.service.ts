import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment, BookingStatus } from './entities/appointment.entity';
import { DataSource, In, Repository } from 'typeorm';
import { ServiceAppointment } from './entities/serviceappointment.entity';
import { GetAppointmentDto } from './dto/get-appointment.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Service } from '../services/entities/service.entity';
import { getCurrentDate, getCurrentDayOfWeek } from '@/utils';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { SendEmailDto } from '@/global/email.service';
import { Member } from '../members/entities/member.entity';
import { format } from 'date-fns';

@Injectable()
export class AppointmentsService {
  constructor(
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
    @InjectQueue('send-email') private emailQueue: Queue,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(ServiceAppointment)
    private readonly serviceAppointmentRepository: Repository<ServiceAppointment>,
  ) {}

  // create new appointment by user
  async create(createAppointmentDto: CreateAppointmentDto, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      queryRunner.startTransaction();
      const { serviceIds, memberId, orgId, start, ...rest } =
        createAppointmentDto;

      const services = await this.dataSource
        .getRepository(Service)
        .findBy({ id: In(serviceIds) });
      const member = await this.dataSource
        .getRepository(Member)
        .findOneBy({ id: memberId });
      if (!services || !member)
        throw new NotFoundException('service or member not found');
      const totalTime = services.reduce((pv, cv) => pv + cv.duration, 0);
      const totalPrice = services.reduce((pv, cv) => pv + cv.price, 0);
      const createAppointment = this.appointmentRepository.create({
        ...rest,
        user: { id: userId },
        organization: { id: orgId },
        member: { id: memberId },
        endTime: start + totalTime,
        startTime: start,
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
      queryRunner.commitTransaction();
      // emit an event to create a client
      this.eventEmitter.emit('appointment.created', { userId, orgId });
      this.sendEmail({
        to: member.email,
        recipientName: member.firstName,
        subject: 'Appointment received',
        text: `A user make an appointment to you on ${format(new Date(createAppointment.date), 'dd-MM-YYYY')}`,
      });
      return {
        message: 'Book an appointment successfully',
      };
    } catch (error) {
      queryRunner.rollbackTransaction();
      throw new ForbiddenException('Cannot update the appointment!');
    } finally {
      queryRunner.release();
    }
  }

  // find all appointment by org for a given date
  async findAll(orgId: number, getAppointmentDto: GetAppointmentDto) {
    const { date = getCurrentDate() } = getAppointmentDto;
    const data = await this.appointmentRepository.find({
      where: { organization: { id: orgId }, date },
    });
    return data;
  }

  // get appointment detail
  findOne(id: number) {
    return this.appointmentRepository.findOne({
      where: { id },
      relations: {
        client: true,
      },
    });
  }

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      queryRunner.startTransaction();
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
        appointment.endTime = start + totalTime;
        appointment.startTime = start;
      }
      Object.assign(appointment, rest);
      await this.appointmentRepository.save(appointment);
      queryRunner.commitTransaction();
      return { message: 'Update the appointment successfully' };
    } catch (error) {
      queryRunner.rollbackTransaction();
      throw new ForbiddenException('Cannot Update the appointment');
    } finally {
      queryRunner.release();
    }
  }

  async confirmBooking(id: number, appointment: Appointment) {
    this.appointmentRepository.update(id, { status: BookingStatus.confirmed });
    // send email about booking confirmation
    this.sendEmail({
      to: appointment.email,
      text: 'Confirm your booking',
      recipientName: appointment.username,
      subject: 'Booking confirmed',
    });
    return {
      message: 'Confirm booking succesfully',
    };
  }

  async cancelBooking(id: number, appointment: Appointment) {
    this.appointmentRepository.update(id, { status: BookingStatus.cancelled });
    // send email about booking cancelation
    this.sendEmail({
      to: appointment.email,
      text: 'Cancel your booking',
      recipientName: appointment.username,
      subject: 'Booking cancelation',
    });
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
    return appointment;
  }

  sendEmail(emailPayload: SendEmailDto) {
    this.emailQueue.add('sendEmail', emailPayload);
  }
}
