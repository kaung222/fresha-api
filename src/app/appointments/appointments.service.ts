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
import { Service } from '../services/entities/service.entity';
import { getDatesBetweenDates } from '@/utils';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { SendEmailDto } from '@/global/email.service';
import { CommissionFeesType, Member } from '../members/entities/member.entity';
import { format } from 'date-fns';
import { CreateQuickAppointment } from './dto/create-quick-appointment.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { PaymentsService } from '../payments/payments.service';
import { CreateNotificationDto } from '../notifications/dto/create-notification.dto';
import { ClientAppointmentDto } from './dto/create-client-booking.dto';
import { Client } from '../clients/entities/client.entity';
import { CompleteAppointmentDto } from './dto/complete-booking.dto';
import { User } from '../users/entities/user.entity';
import { createAppointmentByUser } from '../notifications/test';

@Injectable()
export class AppointmentsService {
  constructor(
    private dataSource: DataSource,
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
      const [services, member, user] = await Promise.all([
        this.getServicesByIds(serviceIds, orgId),
        this.getMemberById(memberId, orgId),
        this.getUserById(userId),
      ]);
      const { totalPrice, totalTime, discountPrice } =
        this.calculateTimeAndPrice(services);
      const commissionFees = this.calculateCommissionFees(
        totalPrice,
        member.commissionFees,
        member.commissionFeesType,
      );
      const newAppointment = this.appointmentRepository.create({
        ...rest,
        user,
        organization: { id: orgId },
        member,
        discountPrice,
        endTime: startTime + totalTime,
        commissionFees,
        isOnlineBooking: true,
        startTime,
        totalTime,
        totalPrice,
        services,
      });
      const appointment = await this.appointmentRepository.save(newAppointment);
      await queryRunner.commitTransaction();
      this.createAppointmentByUserEvent(appointment);
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

  private async createAppointmentByUserEvent(appointment: Appointment) {
    const { member, date, organization, user } = appointment;
    this.sendEmailToMember(member, date);

    // generating notification payload
    const createNotificationDto = createAppointmentByUser(
      organization.id,
      user,
    );
    // save and send notification
    this.createNotification(createNotificationDto);
  }

  async createClientAppointment(
    orgId: number,
    addAppointmentDto: ClientAppointmentDto,
  ) {
    const { serviceIds, startTime, memberId, ...rest } = addAppointmentDto;
    const appointmentRepository = this.dataSource.getRepository(Appointment);
    const [services, member] = await Promise.all([
      this.getServicesByIds(serviceIds, orgId),
      this.getMemberById(memberId, orgId),
    ]);
    // calculate time and price
    const { totalPrice, totalTime, discountPrice } =
      this.calculateTimeAndPrice(services);
    const commissionFees = this.calculateCommissionFees(
      totalPrice,
      member.commissionFees,
      member.commissionFeesType,
    );
    const createAppointment = appointmentRepository.create({
      ...rest,
      organization: { id: orgId },
      member,
      startTime,
      endTime: startTime + totalTime,
      totalPrice,
      totalTime,
      commissionFees,
      services,
      discountPrice,
    });
    await appointmentRepository.save(createAppointment);
    return {
      message: 'Added appointment successfully',
    };
  }

  private calculateCommissionFees(
    totalPrice: number,
    fees: number,
    feeType: CommissionFeesType,
  ) {
    switch (feeType) {
      case (feeType = CommissionFeesType.fixed):
        return fees;
      case (feeType = CommissionFeesType.percent):
        return (totalPrice * fees) / 100;
    }
  }
  private async getUserById(userId: number) {
    return await this.dataSource.getRepository(User).findOneBy({ id: userId });
  }
  async getClientById(clientId: number, orgId: number) {
    return await this.dataSource
      .getRepository(Client)
      .findOneByOrFail({ id: clientId, orgId });
  }

  private sendEmailToMember(member: Member, appointmentDate: string) {
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

  private calculateTimeAndPrice(services: Service[]) {
    const totalTime = services.reduce((pv, cv) => pv + cv.duration, 0);
    const totalPrice = services.reduce((pv, cv) => pv + cv.price, 0);
    const discountPrice = services.reduce((pv, cv) => pv + cv.discountPrice, 0);
    return {
      totalPrice,
      totalTime,
      discountPrice,
    };
  }

  // find all appointment by org for a given date
  async findAll(orgId: number, getAppointmentDto: GetAppointmentDto) {
    const { startDate, endDate } = getAppointmentDto;
    const dates = getDatesBetweenDates(startDate, endDate);
    return await this.appointmentRepository.find({
      where: { orgId, date: In(dates) },
      relations: {
        services: true,
      },
    });
  }

  async getBookingsByMemberId(
    memberId: number,
    getAppointmentDto: GetAppointmentDto,
  ) {
    const { startDate, endDate } = getAppointmentDto;
    const dates = getDatesBetweenDates(startDate, endDate);
    return await this.appointmentRepository.find({
      where: { memberId, date: In(dates) },
    });
  }

  // get appointment detail by org
  findOne(id: number) {
    return this.appointmentRepository.findOne({
      where: { id },
      relations: {
        services: true,
        user: true,
        member: true,
      },
    });
  }

  // get appointment detail by user
  findOneByUser(id: number) {
    return this.appointmentRepository.findOne({
      where: { id },
      relations: {
        services: true,
        organization: true,
      },
    });
  }

  async update(
    id: number,
    updateAppointmentDto: UpdateAppointmentDto,
    orgId: number,
  ) {
    const appointment = await this.getBookingById(id, orgId, ['services']);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const { serviceIds, memberId, ...rest } = updateAppointmentDto;

      const [services, member] = await Promise.all([
        this.getServicesByIds(serviceIds, orgId),
        this.getMemberById(memberId, orgId),
      ]);
      // calcualte total time and price and discount price
      const { totalPrice, totalTime, discountPrice } =
        this.calculateTimeAndPrice(services);

      // calculate the commissions
      const commissionFees = this.calculateCommissionFees(
        totalPrice,
        member.commissionFees,
        member.commissionFeesType,
      );
      appointment.services = services;
      appointment.totalTime = totalTime;
      appointment.endTime = rest.startTime + totalTime;
      appointment.startTime = rest.startTime;
      appointment.totalPrice = totalPrice;
      appointment.discountPrice = discountPrice;
      appointment.commissionFees = commissionFees;
      appointment.member = member;
      // save the update data
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

  async confirmBooking(id: number, orgId: number) {
    const appointment = await this.getBookingById(id, orgId);
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
    const appointment = await this.getBookingById(id, orgId);
    const updateRes = await this.appointmentRepository.update(id, {
      status: BookingStatus.cancelled,
    });
    // send email about booking cancelation
    if (updateRes.affected !== 1)
      throw new ForbiddenException('Cannot cancel booking now');
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

  async completeBooking(
    id: number,
    completeAppointment: CompleteAppointmentDto,
    orgId: number,
  ) {
    const { notes, paymentMethod, commissionFees, tips } = completeAppointment;
    const appointment = await this.getBookingById(id, orgId);
    await this.appointmentRepository.update(id, {
      status: BookingStatus.completed,
      commissionFees,
      tips,
    });
    // on complete appointment create payment
    this.paymentService.createPaymentByAppointment({
      // the total amount of user paid
      amount: appointment.discountPrice + tips,
      clientName: appointment.username,
      appointmentId: id,
      method: paymentMethod,
      orgId,
      notes,
    });
    return {
      message: 'Marked as complete booking succesfully',
    };
  }

  async remove(id: number, orgId: number) {
    await this.getBookingById(id, orgId);
    this.appointmentRepository.delete({ id });
    return {
      message: 'Delete booking succesfully',
    };
  }

  async getBookingById(bookingId: number, orgId: number, relations?: string[]) {
    const appointment = await this.appointmentRepository.findOne({
      where: {
        orgId,
        id: bookingId,
      },
      relations,
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  sendEmail(emailPayload: SendEmailDto) {
    this.emailQueue.add('sendEmail', emailPayload);
  }

  createNotification(createNotification: CreateNotificationDto) {
    this.notificationQueue.add('notification.created', createNotification);
  }
}
