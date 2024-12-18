import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmailBySystem } from './dto/crearte-email.dto';
import { Email } from './entities/email.entity';
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
    const { isToAllClient, ...rest } = createEmailDto;
    if (isToAllClient) {
      const data: { email: string }[] = await this.dataSource
        .getRepository(Client)
        .createQueryBuilder()
        .select('email', 'email')
        .where('orgId=:orgId', { orgId })
        .getRawMany();
      if (data.length === 0) throw new NotFoundException('No client existed');
      const emails = [...new Set(data?.map((d) => d.email))];
      const email = this.emailRepository.create({ ...rest, orgId, to: emails });
      await this.emailQueue.add('sendEmail', email);
      return {
        message: 'Send emails successfully',
      };
    }
    const email = this.emailRepository.create({ orgId, ...createEmailDto });
    await this.emailQueue.add('sendEmail', email);
    await this.cacheService.del(this.getCacheKey(orgId));
    return { message: 'Send emails successfully' };
  }

  async sendEmailToAdmins(sendEmail: SendEmailToAdmin) {
    const createEmail = this.emailRepository.create({
      ...sendEmail,
      to: 'thirdgodiswinning@gmail.com',
    });
    const email = await this.emailRepository.save(createEmail);
    this.emailQueue.add('sendEmailWithoutSaving', email);
    return { message: 'Send message successfully' };
  }

  private async sendEmailToClients(orgId: number) {
    const clients = await this.dataSource
      .getRepository(Client)
      .findBy({ orgId });
    const emails = this.emailRepository.create({});
  }

  async createWithoutSave(createEmailDto: CreateEmailBySystem) {
    // directly send email
    this.emailQueue.add('sendEmailWithoutSaving', createEmailDto);
  }

  async createAppointByUser(appointment: Appointment) {}

  async createAppointByOrg(appointment: Appointment) {
    const memberEmail = sendBookingNotiToMember(appointment);
    const userEmail = sendBookingNotiToUser(appointment);
    await this.emailQueue.add('sendEmailWithoutSaving', memberEmail);
    await this.emailQueue.add('sendEmailWithoutSaving', userEmail);
  }

  async cancelBookingByOrg(appointment: Appointment, reason: string) {
    const userEmail = cancelBookingByOrg(appointment, reason);
    await this.emailQueue.add('sendEmailWithoutSaving', userEmail);
  }

  async rescheduleBookingByOrg(appointment: Appointment, reason: string) {
    const userEmail = rescheduleBookingByOrg(appointment, reason);
    await this.emailQueue.add('sendEmailWithoutSaving', userEmail);
  }

  async confirmBookingByOrg(appointment: Appointment) {
    const userEmail = confirmBookingByOrg(appointment);
    await this.emailQueue.add('sendEmailWithoutSaving', userEmail);
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
