import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from './entities/client.entity';
import { DataSource, In, Repository } from 'typeorm';
import { PaginationResponse } from '@/utils/paginate-res.dto';
import { CreateAppointmentDto } from '../appointments/dto/create-appointment.dto';
import { Appointment } from '../appointments/entities/appointment.entity';
import { ServiceAppointment } from '../appointments/entities/serviceappointment.entity';
import { AddAppointmentDto } from './dto/create-appointment.dto';
import { Service } from '../services/entities/service.entity';

@Injectable()
export class ClientsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}
  // create new clinet of organization
  @OnEvent('appointment.created')
  async create(orgId: number, createClientDto: CreateClientDto) {
    const createClient = this.clientRepository.create({
      ...createClientDto,
      organization: { id: orgId },
    });
    const client = await this.clientRepository.save(createClient);
    return {
      message: 'Create client successfully',
      data: client,
    };
  }

  async findAll(orgId: number) {
    let page = 1;
    const [data, totalCount] = await this.clientRepository.findAndCount({
      where: { organization: { id: orgId } },
    });
    return new PaginationResponse({ data, totalCount, page }).toResponse();
  }

  findOne(id: number) {
    return this.clientRepository.findOne({ where: { id }, relations: {} });
  }

  update(id: number, updateClientDto: UpdateClientDto) {
    return this.clientRepository.update(id, updateClientDto);
  }

  async createAppointment(orgId: number, addAppointmentDto: AddAppointmentDto) {
    const { serviceIds, clientId, start, memberId, ...rest } =
      addAppointmentDto;
    const appointmentRepository = this.dataSource.getRepository(Appointment);
    const bookingItemRepository =
      this.dataSource.getRepository(ServiceAppointment);
    const services = await this.dataSource
      .getRepository(Service)
      .findBy({ id: In(serviceIds) });
    const totalTime = services.reduce((pv, cv) => pv + cv.duration, 0);
    const totalPrice = services.reduce((pv, cv) => pv + cv.price, 0);
    const createAppointment = appointmentRepository.create({
      ...rest,
      organization: { id: orgId },
      member: { id: memberId },
      client: { id: clientId },
      start,
      end: start + totalTime,
      totalPrice,
      totalTime,
    });

    const appointment = await appointmentRepository.save(createAppointment);
    const createBookingItems = bookingItemRepository.create(
      serviceIds.map((serviceId) => ({
        service: { id: serviceId },
        appointment: { id: appointment.id },
      })),
    );

    await bookingItemRepository.save(createBookingItems);
    return {
      message: 'Added appointment successfully',
    };
  }

  remove(id: number) {
    return this.clientRepository.delete(id);
  }

  async checkOwnership(id: number, orgId: number): Promise<Client> {
    const client = await this.clientRepository.findOneBy({
      id,
      organization: { id: orgId },
    });
    if (!client) throw new NotFoundException('client not found');
    return client;
  }
}
