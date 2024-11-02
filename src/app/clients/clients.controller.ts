import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Role } from '@/security/role.decorator';
import { Roles, User } from '@/security/user.decorator';
import { AddAppointmentDto } from './dto/create-appointment.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('clients')
@ApiTags('Client')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @Role(Roles.org)
  create(
    @Body() createClientDto: CreateClientDto,
    @User('orgId') orgId: number,
  ) {
    return this.clientsService.create(orgId, createClientDto);
  }

  @Get()
  @Role(Roles.org)
  findAll(@User('orgId') orgId: number) {
    return this.clientsService.findAll(orgId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clientsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto) {
    return this.clientsService.update(+id, updateClientDto);
  }

  @Post(':id/appointments')
  @Role(Roles.org)
  createAppointment(
    @User('orgId') orgId: number,
    @Body() addAppointmentDto: AddAppointmentDto,
  ) {
    return this.clientsService.createAppointment(orgId, addAppointmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clientsService.remove(+id);
  }
}
