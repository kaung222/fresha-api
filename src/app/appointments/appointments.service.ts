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
import { GetAppointmentDto } from './dto/get-appointment.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Service } from '../services/entities/service.entity';
import { getCurrentDate, getCurrentDayOfWeek } from '@/utils';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { SendEmailDto } from '@/global/email.service';
import { Member } from '../members/entities/member.entity';
import { format } from 'date-fns';
import { CreateQuickAppointment } from './dto/create-quick-appointment.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { PaymentsService } from '../payments/payments.service';
import { PaymentMethod } from '../payments/entities/payment.entity';
import { CreateNotificationDto } from '../notifications/dto/create-notification.dto';
import { ClientAppointmentDto } from './dto/create-client-booking.dto';
import { Client } from '../clients/entities/client.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
    @InjectQueue('emailQueue') private emailQueue: Queue,
    @InjectQueue('notificationQueue') private notificationQueue: Queue,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly paymentService: PaymentsService,
  ) {}

  // create new appointment by user
  async create(createAppointmentDto: CreateAppointmentDto, userId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const { serviceIds, memberId, orgId, startTime, ...rest } =
        createAppointmentDto;
      const services = await this.getServicesByIds(serviceIds, orgId);
      const member = await this.getMemberById(memberId, orgId);
      const { totalPrice, totalTime } = this.calculateTimeAndPrice(services);
      const newAppointment = this.appointmentRepository.create({
        ...rest,
        user: { id: userId },
        organization: { id: orgId },
        member: { id: memberId },
        endTime: startTime + totalTime,
        startTime,
        totalTime,
        totalPrice,
        services,
      });
      const appointment = await this.appointmentRepository.save(newAppointment);
      await queryRunner.commitTransaction();
      this.sendEmailToMember(member, appointment.date);
      return {
        message: 'Book an appointment successfully',
        appointment,
      };
    } catch (error) {
      queryRunner.rollbackTransaction();
      throw new ForbiddenException('Cannot update the appointment!');
    } finally {
      queryRunner.release();
    }
  }

  async createClientAppointment(
    orgId: number,
    addAppointmentDto: ClientAppointmentDto,
  ) {
    const { serviceIds, clientId, startTime, memberId, ...rest } =
      addAppointmentDto;
    const appointmentRepository = this.dataSource.getRepository(Appointment);
    const client = await this.getClientById(clientId, orgId);
    const services = await this.getServicesByIds(serviceIds, orgId);
    const { totalPrice, totalTime } = this.calculateTimeAndPrice(services);
    const createAppointment = appointmentRepository.create({
      ...rest,
      organization: { id: orgId },
      member: { id: memberId },
      client,
      startTime,
      endTime: startTime + totalTime,
      totalPrice,
      totalTime,
      services,
    });
    await appointmentRepository.save(createAppointment);
    return {
      message: 'Added appointment successfully',
    };
  }

  async getClientById(clientId: number, orgId: number) {
    return await this.dataSource
      .getRepository(Client)
      .findOneByOrFail({ id: clientId, orgId });
  }

  private async sendEmailToMember(member: Member, appointmentDate: string) {
    this.sendEmail({
      to: member.email,
      recipientName: member.firstName,
      subject: 'Appointment received',
      text: `A user make an appointment to you on ${format(new Date(appointmentDate), 'dd-MM-YYYY')}`,
    });
  }

  private async getMemberById(memberId: number, orgId: number) {
    return await this.dataSource
      .getRepository(Member)
      .findOneByOrFail({ id: memberId, orgId });
  }

  async getServicesByIds(serviceIds: number[], orgId: number) {
    const services = await this.dataSource
      .getRepository(Service)
      .findBy({ id: In(serviceIds), orgId });
    if (serviceIds.length !== services.length)
      throw new NotFoundException('Some services are missing');
    return services;
  }

  calculateTimeAndPrice(services: Service[]) {
    const totalTime = services.reduce((pv, cv) => pv + cv.duration, 0);
    const totalPrice = services.reduce((pv, cv) => pv + cv.price, 0);
    return {
      totalPrice,
      totalTime,
    };
  }

  async createQuickAppointment(
    orgId: number,
    quickAppointment: CreateQuickAppointment,
  ) {
    const { serviceIds, startTime, ...rest } = quickAppointment;
    const services = await this.getServicesByIds(serviceIds, orgId);
    const { totalPrice, totalTime } = this.calculateTimeAndPrice(services);
    const createAppointment = this.appointmentRepository.create({
      ...rest,
      services,
      organization: { id: orgId },
      startTime,
      endTime: startTime + totalTime,
      totalPrice,
      totalTime,
    });
    return await this.appointmentRepository.save(createAppointment);
  }

  // find all appointment by org for a given date
  async findAll(orgId: number, getAppointmentDto: GetAppointmentDto) {
    const { date = getCurrentDate() } = getAppointmentDto;
    const data = await this.appointmentRepository.find({
      where: { orgId, date },
      relations: {
        services: true,
      },
    });
    return data;
  }

  // get appointment detail
  findOne(id: number) {
    return this.appointmentRepository.findOne({
      where: { id },
      relations: {
        client: true,
        services: true,
        user: true,
      },
    });
  }

  async update(
    id: number,
    updateAppointmentDto: UpdateAppointmentDto,
    orgId: number,
  ) {
    const appointment = await this.checkOwnership(id, orgId);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const { serviceIds, ...rest } = updateAppointmentDto;
      const services = await this.getServicesByIds(serviceIds, orgId);
      const { totalPrice, totalTime } = this.calculateTimeAndPrice(services);
      appointment.services = services;
      appointment.totalTime = totalTime;
      appointment.endTime = rest.startTime + totalTime;
      appointment.startTime = rest.startTime;
      appointment.totalPrice = totalPrice;
      await this.appointmentRepository.save(appointment);
      await queryRunner.commitTransaction();
      return { message: 'Update the appointment successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new ForbiddenException('Cannot Update the appointment');
    } finally {
      await queryRunner.release();
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

  async cancelBooking(
    id: number,
    cancelBookingDto: CancelBookingDto,
    orgId: number,
  ) {
    const appointment = await this.checkOwnership(id, orgId);
    this.appointmentRepository.update(id, { status: BookingStatus.cancelled });
    // send email about booking cancelation
    this.sendEmail({
      to: appointment.email,
      text: `Cancel your booking for the reason ${cancelBookingDto.reason}`,
      recipientName: appointment.username,
      subject: 'Booking cancelation',
    });
    return {
      message: 'Cancel booking succesfully',
    };
  }

  async completeBooking(id: number, orgId: number) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id, orgId },
      relations: { services: true },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    await this.appointmentRepository.update(id, {
      status: BookingStatus.completed,
    });
    // on complete appointment create payment
    this.paymentService.createPaymentByAppointment({
      amount: appointment.totalPrice,
      clientName: appointment.username,
      memberId: appointment.memberId,
      method: PaymentMethod.cash,
      orgId,
      services: appointment.services,
    });
    return {
      message: 'Marked as complete booking succesfully',
    };
  }

  remove(id: number) {
    this.appointmentRepository.delete(id);
    return {
      message: 'Delete booking succesfully',
    };
  }

  async checkOwnership(id: number, orgId: number) {
    return await this.appointmentRepository.findOne({
      where: {
        organization: { id: orgId },

        id,
      },
      relations: { services: true },
    });
  }

  async sendEmail(emailPayload: SendEmailDto) {
    this.emailQueue.add('sendEmail', emailPayload);
  }

  createNotification(createNotification: CreateNotificationDto) {
    this.notificationQueue.add('notification.created', createNotification);
  }
}
