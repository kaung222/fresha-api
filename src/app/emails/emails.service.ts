import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmailDto } from './dto/crearte-email.dto';
import { Email } from './entities/email.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GetEmailDto } from './dto/get-email.dot';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class EmailsService {
  constructor(
    @InjectRepository(Email)
    private readonly emailRepository: Repository<Email>,
    @InjectQueue('emailQueue')
    private readonly emailQueue: Queue,
  ) {}

  async create(orgId: number, createEmailDto: CreateEmailDto) {
    const email = this.emailRepository.create({ orgId, ...createEmailDto });
    this.emailQueue.add('sendEmail', email);
  }

  async createWithoutSave(createEmailDto: CreateEmailDto) {
    // directly send email
    this.emailQueue.add('sendEmailWithoutSaving', createEmailDto);
  }

  async findAll(orgId: number, getEmailDto: GetEmailDto) {
    const emails = await this.emailRepository.find({ where: { orgId } });
    return emails;
  }

  async remove(id: string, orgId: number) {
    const response = await this.emailRepository.delete({ id, orgId });
    if (response.affected !== 1) throw new NotFoundException('Email not found');
    return {
      message: 'Delete email successfully',
    };
  }
}
