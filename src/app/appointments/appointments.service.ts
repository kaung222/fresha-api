import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment, BookingStatus } from './entities/appointment.entity';
import { Between, DataSource, In, Repository } from 'typeorm';
import { GetAppointmentDto } from './dto/get-appointment.dto';
import { Service } from '../services/entities/service.entity';
import { CommissionFeesType, Member } from '../members/entities/member.entity';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { PaymentsService } from '../payments/payments.service';
import {
  BookingItemDto,
  ClientAppointmentDto,
} from './dto/create-client-booking.dto';
import { CompleteAppointmentDto } from './dto/complete-booking.dto';
import { User } from '../users/entities/user.entity';
import { BookingItem } from './entities/booking-item.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { EmailsService } from '../emails/emails.service';
import { RescheduleBookingDto } from './dto/reschedule-booking.dto';
import { CacheService, CacheTTL } from '@/global/cache.service';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(BookingItem)
    private readonly itemRepository: Repository<BookingItem>,
    private readonly paymentService: PaymentsService,
    private dataSource: DataSource,
    private readonly emailService: EmailsService,
    // private readonly cacheService: CacheService,
  ) {}

  // create new appointment by user
  async create(createAppointmentDto: CreateAppointmentDto, userId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { bookingItems, orgId, ...rest } = createAppointmentDto;
      const [user, organization] = await Promise.all([
        this.getUserById(userId),
        this.getOrgById(orgId),
      ]);
      const createAppointment = this.appointmentRepository.create({
        ...rest,
        organization,
        user,
        isOnlineBooking: true,
        orgEmail: organization.email,
        orgName: organization.name,
      });

      // create new appointment
      const appointment =
        await this.appointmentRepository.save(createAppointment);
      // save booking items and update the appointment
      const items = await this.saveBookingItems(bookingItems, appointment);
      const { totalPrice, totalTime, discountPrice, totalCommissionFees } =
        this.calculateTimeAndPrice(items);

      // update related data
      appointment.bookingItems = items;
      appointment.totalPrice = totalPrice;
      appointment.totalTime = totalTime;
      appointment.totalCommissionFees = totalCommissionFees;
      appointment.endTime = appointment.startTime + totalTime;
      appointment.discountPrice = discountPrice;
      await this.appointmentRepository.save(appointment);
      // commit transaction
      await queryRunner.commitTransaction();
      this.emailService.createAppointByUser(appointment);
      return {
        message: 'Book an appointment successfully',
        appointment,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new ForbiddenException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  // create client appointment from org dashboard
  async createClientAppointment(
    orgId: number,
    addAppointmentDto: ClientAppointmentDto,
  ) {
    const { bookingItems, startTime, ...rest } = addAppointmentDto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const organization = await this.getOrgById(orgId);
      // save appointment
      const createAppointment = this.appointmentRepository.create({
        ...rest,

        startTime,
        orgId,
        orgEmail: organization.email,
        orgName: organization.name,
      });
      const appointment =
        await this.appointmentRepository.save(createAppointment);
      // save booking item
      const items = await this.saveBookingItems(bookingItems, appointment);
      console.log(items);
      // calculate time and price
      const { totalPrice, totalTime, discountPrice, totalCommissionFees } =
        this.calculateTimeAndPrice(items);

      // update totalPrice , time and fee
      appointment.bookingItems = items;
      appointment.totalPrice = totalPrice;
      appointment.totalTime = totalTime;
      appointment.totalCommissionFees = totalCommissionFees;
      appointment.endTime = appointment.startTime + totalTime;
      appointment.discountPrice = discountPrice;
      await this.appointmentRepository.save(appointment);
      // send email to member and user
      this.emailService.createAppointByOrg(appointment);
      // commit trunsaction
      await queryRunner.commitTransaction();
      return {
        message: 'Create appointment successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new ForbiddenException();
    } finally {
      await queryRunner.release();
    }
  }

  private async saveBookingItems(
    items: BookingItemDto[],
    appointment: Appointment,
  ) {
    const serviceIds = [...new Set([...items.map((item) => item?.serviceId)])];
    const memberIds = [...new Set([...items.map((item) => item?.memberId)])];
    console.log(serviceIds, memberIds);
    const [services, members] = await Promise.all([
      this.getServicesByIds(serviceIds, appointment.orgId),
      this.getMemberByIds(memberIds, appointment.orgId),
    ]);
    // to override use the endtime of previous booking item
    let startTime = appointment.startTime;
    const createBookingItems = this.itemRepository.create(
      items.map(({ serviceId, memberId }) => {
        const service = services.find((service) => service.id === serviceId);
        const member = members.find((member) => member.id === memberId);
        const commissionFees = this.calculateCommissionFees(
          service.discountPrice,
          member.commissionFees,
          member.commissionFeesType,
        );
        const endTime = startTime + service.duration;
        const res = {
          appointmentId: appointment.id,
          member,
          service,
          memberName: member.firstName,
          serviceName: service.name,
          startTime,
          endTime,
          // date: appointment.date,
          discountPrice: service.discountPrice,
          duration: service.duration,
          price: service.price,
          commissionFees,
        };
        // the end time will be the start time of next booking items
        startTime = endTime;
        return res;
      }),
    );
    return await this.itemRepository.save(createBookingItems);
  }
  // calcuate the commissionfees of appointment for a selected member
  private calculateCommissionFees(
    price: number,
    fees: number,
    feeType: CommissionFeesType,
  ) {
    switch (feeType) {
      case (feeType = CommissionFeesType.fixed):
        return fees;
      case (feeType = CommissionFeesType.percent):
        return (price * fees) / 100;
    }
  }

  private async getUserById(userId: string) {
    const user = await this.dataSource
      .getRepository(User)
      .findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private async getOrgById(id: number) {
    const org = await this.dataSource
      .getRepository(Organization)
      .findOneBy({ id });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  private async getMemberByIds(memberIds: string[], orgId: number) {
    const members = await this.dataSource
      .getRepository(Member)
      .findBy({ id: In(memberIds), orgId });
    if (memberIds.length !== members.length)
      throw new NotFoundException('some members are missing');
    return members;
  }

  async getServicesByIds(serviceIds: string[], orgId: number) {
    const ids = [...new Set([...serviceIds])];
    const services = await this.dataSource
      .getRepository(Service)
      .findBy({ id: In(ids), orgId });
    if (ids.length !== services.length)
      throw new NotFoundException('Some services are missing');
    return services;
  }

  private calculateTimeAndPrice(items: BookingItem[]) {
    const totalTime = items.reduce((pv, cv) => pv + cv.duration, 0);
    const totalPrice = items.reduce((pv, cv) => pv + cv.price, 0);
    const discountPrice = items.reduce((pv, cv) => pv + cv.discountPrice, 0);
    const totalCommissionFees = items.reduce(
      (pv, cv) => pv + cv.commissionFees,
      0,
    );
    return {
      totalPrice,
      totalCommissionFees,
      totalTime,
      discountPrice,
    };
  }

  // find all appointment by org for a given date
  async findAll(orgId: number, getAppointmentDto: GetAppointmentDto) {
    const { startDate, endDate } = getAppointmentDto;
    const response = await this.appointmentRepository.find({
      where: { orgId, date: Between(startDate, endDate) },
      relations: {
        bookingItems: true,
      },
    });
    return response;
  }

  // find all appointment by org for a given date by created date
  async findAllByCreatedDate(
    orgId: number,
    getAppointmentDto: GetAppointmentDto,
  ) {
    const { startDate, endDate } = getAppointmentDto;
    const appointments = await this.appointmentRepository.find({
      where: { orgId, createdAt: Between(startDate, endDate) },
      relations: {
        bookingItems: true,
      },
      order: { createdAt: 'desc' },
    });
    return appointments;
  }

  private getCacheKey(orgId: number, getAppointmentDto: GetAppointmentDto) {
    const { startDate, endDate } = getAppointmentDto;
    return `org:${orgId}:${startDate}:${endDate}`;
  }

  // get appointment detail by org
  findOne(id: string, orgId: number) {
    const appointment = this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.id=:id', { id })
      .andWhere('appointment.orgId=:orgId', { orgId })
      .leftJoinAndSelect('appointment.user', 'user')
      .leftJoinAndSelect('appointment.bookingItems', 'bookingItems')
      .leftJoinAndSelect('bookingItems.service', 'service')
      .leftJoinAndSelect('bookingItems.member', 'member')
      .leftJoin('member.services', 'services')
      .addSelect('services.id')
      .getOne();
    if (!appointment) throw new NotFoundException('Booking not found');
    return appointment;
  }

  // get appointment detail by user
  findOneByUser(id: string, userId: string) {
    return this.appointmentRepository.findOne({
      where: { id, userId },
      relations: {
        organization: true,
        bookingItems: true,
      },
    });
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
    orgId: number,
  ) {
    const { bookingItems, ...rest } = updateAppointmentDto;
    const appointment = await this.getBookingById(id, orgId);
    // transaction start
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    await this.itemRepository.delete({ appointmentId: id });
    appointment.startTime = rest.startTime;
    try {
      const items = await this.saveBookingItems(bookingItems, appointment);
      // calculate time and price
      const { totalPrice, totalTime, discountPrice, totalCommissionFees } =
        this.calculateTimeAndPrice(items);
      appointment.totalPrice = totalPrice;
      appointment.totalTime = totalTime;
      appointment.totalCommissionFees = totalCommissionFees;
      appointment.endTime = appointment.startTime + totalTime;
      appointment.discountPrice = discountPrice;
      Object.assign(appointment, rest);
      // save the update data
      await this.appointmentRepository.save(appointment);
      // commit transaction
      await queryRunner.commitTransaction();
      return { message: 'Update the appointment successfully' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new ForbiddenException('Cannot Update the appointment');
    } finally {
      await queryRunner.release();
    }
  }

  async confirmBooking(id: string, orgId: number) {
    const appointment = await this.getBookingById(id, orgId);
    // if completed , cannot be confirmed
    if (appointment.status === BookingStatus.completed)
      throw new ForbiddenException('Completed booking cannot be confirmed!');
    await this.appointmentRepository.update(id, {
      status: BookingStatus.confirmed,
    });
    // send email about booking confirmation
    await this.emailService.confirmBookingByOrg(appointment);
    return {
      message: 'Confirm booking succesfully',
    };
  }

  async cancelBooking(
    id: string,
    cancelBookingDto: CancelBookingDto,
    orgId: number,
  ) {
    const appointment = await this.getBookingById(id, orgId);

    // if complete , cannot be cancelled
    if (appointment.status === BookingStatus.completed)
      throw new ForbiddenException('Completed booking cannot be cancelled!');
    const updateRes = await this.appointmentRepository.update(id, {
      status: BookingStatus.cancelled,
    });
    // send email about booking cancelation
    if (updateRes.affected !== 1)
      throw new ForbiddenException('Cannot cancel booking now');
    this.emailService.cancelBookingByOrg(appointment, cancelBookingDto.reason);
    return {
      message: 'Cancel booking succesfully',
    };
  }

  async completeBooking(
    id: string,
    completeAppointment: CompleteAppointmentDto,
    orgId: number,
  ) {
    const { notes, paymentMethod } = completeAppointment;
    const appointment = await this.getBookingById(id, orgId);
    await this.appointmentRepository.update(id, {
      status: BookingStatus.completed,
    });
    // on complete appointment create payment
    this.paymentService.createPaymentByAppointment({
      // the total amount of user paid
      amount: appointment.discountPrice,
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

  async rescheduleBooking(
    id: string,
    rescheduleBookingDto: RescheduleBookingDto,
    orgId: number,
  ) {
    const { reason, startTime, date } = rescheduleBookingDto;
    const appointment = await this.getBookingById(id, orgId, ['bookingItems']);
    const { totalTime } = this.calculateTimeAndPrice(appointment.bookingItems);
    await this.appointmentRepository.update(id, {
      date,
      startTime,
      endTime: startTime + totalTime,
    });
    // const newDate = new Date(date)
    await this.emailService.rescheduleBookingByOrg(appointment, date, reason);
    return {
      message: 'Marked as complete booking succesfully',
    };
  }

  // delete booking by org
  async remove(id: string, orgId: number) {
    await this.getBookingById(id, orgId);
    this.appointmentRepository.delete({ id });
    return {
      message: 'Delete booking succesfully',
    };
  }

  // get booking by id
  async getBookingById(bookingId: string, orgId: number, relations?: string[]) {
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
}
