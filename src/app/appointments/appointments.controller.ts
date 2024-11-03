import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@/security/role.decorator';
import { Roles, User } from '@/security/user.decorator';
import { PaginateQuery } from '@/utils/paginate-query.dto';
import { GetAppointmentDto } from './dto/get-appointment.dto';

@Controller('appointments')
@ApiTags('Appointment')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create booking by user' })
  @Role(Roles.user)
  create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @User('id') userId: number,
  ) {
    return this.appointmentsService.create(createAppointmentDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get bookings by org or member' })
  @Role(Roles.org, Roles.member)
  findAll(
    @User('orgId') orgId: number,
    @Query() getAppointmentDto: GetAppointmentDto,
  ) {
    return this.appointmentsService.findAll(orgId, getAppointmentDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details' })
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(+id);
  }

  getAvailableTimeSlots(memberId: number, date?: string) {
    return this.appointmentsService.getAvailableTimeSlots(memberId, date);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update booking by org or member, only created ones',
  })
  @Role(Roles.org, Roles.member)
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @User('orgId') orgId: number,
  ) {
    await this.appointmentsService.checkOwnership(+id, orgId);
    return this.appointmentsService.update(+id, updateAppointmentDto);
  }

  @Patch(':id/confirm')
  @Role(Roles.org, Roles.member)
  @ApiOperation({ summary: 'Confirm booking by org or member' })
  async confirmBooking(@Param('id') id: string, @User('orgId') orgId: number) {
    await this.appointmentsService.checkOwnership(+id, orgId);
    return this.appointmentsService.confirmBooking(+id);
  }

  @Patch(':id/cancel')
  @Role(Roles.org, Roles.member)
  @ApiOperation({ summary: 'Cancel booking by org or member' })
  async cancelBooking(@Param('id') id: string, @User('orgId') orgId: number) {
    await this.appointmentsService.checkOwnership(+id, orgId);
    return this.appointmentsService.cancelBooking(+id);
  }

  @Patch(':id/complete')
  @Role(Roles.org, Roles.member)
  @ApiOperation({ summary: 'Mark as complete booking by org or member' })
  async completeBooking(@Param('id') id: string, @User('orgId') orgId: number) {
    await this.appointmentsService.checkOwnership(+id, orgId);
    return this.appointmentsService.completeBooking(+id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete booking by org or member' })
  @Role(Roles.org, Roles.member)
  async remove(@Param('id') id: string, @User('orgId') orgId: number) {
    await this.appointmentsService.checkOwnership(+id, orgId);
    return this.appointmentsService.remove(+id);
  }
}
