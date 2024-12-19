import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmailBySystem } from './dto/crearte-email.dto';
import { Email, MailTo } from './entities/email.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { PaginationResponse } from '@/utils/paginate-res.dto';
import { PaginateQuery } from '@/utils/paginate-query.dto';
import { CacheService } from '@/global/cache.service';
import { CreateEmailByOrg } from './dto/create-email-by-org.dto';
import { Client } from '../clients/entities/client.entity';
import { SendEmailToAdmin } from './dto/send-email-to-admin';
import { Appointment } from '../appointments/entities/appointment.entity';
import {
  cancelBookingByOrg,
  confirmBookingByOrg,
  rescheduleBookingByOrg,
  sendBookingNotiToMember,
  sendBookingNotiToUser,
} from '@/utils/helpers/email-fns';
import { Organization } from '../organizations/entities/organization.entity';
import { Member } from '../members/entities/member.entity';

@Injectable()
export class EmailsService {
  constructor(
    @InjectRepository(Email)
    private readonly emailRepository: Repository<Email>,
    @InjectQueue('emailQueue')
    private readonly emailQueue: Queue,
    private cacheService: CacheService,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(orgId: number, paginateQuery: PaginateQuery) {
    const { page = 1 } = paginateQuery;
    const cacheKey = this.getCacheKey(orgId, page);
    const dataInCache = await this.cacheService.get(cacheKey);
    if (dataInCache) return dataInCache;
    const [data, totalCount] = await this.emailRepository.findAndCount({
      where: { orgId },
      take: 20,
      skip: 20 * (page - 1),
    });

    const response = new PaginationResponse({
      page,
      data,
      totalCount,
      pageLimit: 20,
    }).toResponse();
    await this.cacheService.set(cacheKey, response);
    return response;
  }

  async create(createEmailDto: CreateEmailBySystem) {
    const { orgId } = createEmailDto;
    const email = this.emailRepository.create(createEmailDto);
    await this.emailQueue.add('sendEmail', email);
    await this.cacheService.del(this.getCacheKey(orgId));
    return { message: 'Send message successfully' };
  }

  async createByOrg(orgId: number, createEmailDto: CreateEmailByOrg) {
    const { mailTo } = createEmailDto;
    const organization = await this.dataSource
      .getRepository(Organization)
      .findOneBy({ id: orgId });
    if (mailTo == MailTo.client)
      return this.sendEmailToClients(organization, createEmailDto);
    if (mailTo == MailTo.members)
      return this.sendEmailToMembers(organization, createEmailDto);
    if (mailTo == MailTo.custom)
      return this.sendEmailCustom(organization, createEmailDto);
  }

  async sendEmailToAdmins(sendEmail: SendEmailToAdmin) {
    const createEmail = this.emailRepository.create({
      ...sendEmail,
      to: ['thirdgodiswinning@gmail.com'],
    });
    const email = await this.emailRepository.save(createEmail);
    this.emailQueue.add('sendEmailWithoutSaving', email);
    return { message: 'Send message successfully' };
  }

  private async sendEmailToClients(
    organization: Organization,
    createEmailDto: CreateEmailByOrg,
  ) {
    const createEmail = this.emailRepository.create({
      ...createEmailDto,
      from: organization.email,
      mailTo: MailTo.client,
    });
    this.emailRepository.save(createEmail);
    // select client email list
    const clients = await this.dataSource
      .getRepository(Client)
      .find({ select: ['email'], where: { orgId: organization.id } });
    const clientEmails = [...new Set(clients.map((client) => client.email))];
    await this.createWithoutSave({
      ...createEmailDto,
      to: clientEmails,

      from: organization.email,
    });
    return { message: 'Send message to clients successfully' };
  }

  private async sendEmailToMembers(
    organization: Organization,
    createEmailDto: CreateEmailByOrg,
  ) {
    const { subject, text } = createEmailDto;
    const createEmail = this.emailRepository.create({
      ...createEmailDto,
      from: organization.email,
      mailTo: MailTo.members,
    });
    this.emailRepository.save(createEmail);
    // select client email list
    const members = await this.dataSource
      .getRepository(Member)
      .find({ select: ['email'], where: { orgId: organization.id } });
    const memberEmails = [...new Set(members.map((client) => client.email))];
    await this.createWithoutSave({
      ...createEmailDto,
      to: memberEmails,

      from: organization.email,
    });
    return { message: 'Send message to clients successfully' };
  }

  private async sendEmailCustom(
    organization: Organization,
    createEmailDto: CreateEmailByOrg,
  ) {
    const createEmail = this.emailRepository.create({
      ...createEmailDto,
      from: organization.email,
      mailTo: MailTo.custom,
    });
    this.emailRepository.save(createEmail);
    await this.createWithoutSave({
      ...createEmailDto,
      from: organization.email,
    });
    return { message: 'Sent email to provided emails successfully' };
  }

  async createWithoutSave(createEmailDto: CreateEmailBySystem) {
    // directly send email
    this.emailQueue.add('sendEmailWithoutSaving', createEmailDto);
  }

  async createAppointByUser(appointment: Appointment) {}

  async createAppointByOrg(appointment: Appointment) {
    const memberEmail = sendBookingNotiToMember(appointment);
    const userEmail = sendBookingNotiToUser(appointment);
    await this.createWithoutSave(memberEmail);
    await this.createWithoutSave(userEmail);
  }

  async cancelBookingByOrg(appointment: Appointment, reason: string) {
    const userEmail = cancelBookingByOrg(appointment, reason);
    await this.createWithoutSave(userEmail);
  }

  async rescheduleBookingByOrg(appointment: Appointment, reason: string) {
    const userEmail = rescheduleBookingByOrg(appointment, reason);
    await this.createWithoutSave(userEmail);
  }

  async confirmBookingByOrg(appointment: Appointment) {
    const userEmail = confirmBookingByOrg(appointment);
    await this.createWithoutSave(userEmail);
  }

  private getCacheKey(orgId: number, page = 1) {
    return `emails:${orgId}:${page}`;
  }

  async remove(id: string, orgId: number) {
    const response = await this.emailRepository.delete({ id, orgId });
    if (response.affected !== 1) throw new NotFoundException('Email not found');
    await this.cacheService.del(this.getCacheKey(orgId));
    return {
      message: 'Delete email successfully',
    };
  }
}
