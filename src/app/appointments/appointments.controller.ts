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
import { GetAppointmentDto } from './dto/get-appointment.dto';
import { CreateQuickAppointment } from './dto/create-quick-appointment.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { ClientAppointmentDto } from './dto/create-client-booking.dto';

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

  @Post('for/client')
  @ApiOperation({ summary: 'Create booking for client by org' })
  @Role(Roles.org)
  createClientBooking(
    @Body() clientAppointmentDto: ClientAppointmentDto,
    @User('orgId') orgId: number,
  ) {
    return this.appointmentsService.createClientAppointment(
      orgId,
      clientAppointmentDto,
    );
  }

  @Post('quick-sale')
  @ApiOperation({ summary: 'Create Quick booking by org' })
  @Role(Roles.org)
  createQuickSale(
    @User('orgId') orgId: number,
    @Body() quickAppointment: CreateQuickAppointment,
  ) {
    return this.appointmentsService.createQuickAppointment(
      orgId,
      quickAppointment,
    );
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

  @Patch(':id')
  @ApiOperation({
    summary: 'Update booking by org or member, only created ones',
  })
  @Role(Roles.org, Roles.member)
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @User('orgId') orgId: number,
  ) {
    return this.appointmentsService.update(+id, updateAppointmentDto, orgId);
  }

  @Patch(':id/confirm')
  @Role(Roles.org, Roles.member)
  @ApiOperation({ summary: 'Confirm booking by org or member' })
  confirmBooking(@Param('id') id: string, @User('orgId') orgId: number) {
    return this.appointmentsService.confirmBooking(+id, orgId);
  }

  @Patch(':id/cancel')
  @Role(Roles.org, Roles.member)
  @ApiOperation({ summary: 'Cancel booking by org or member' })
  cancelBooking(
    @Param('id') id: string,
    @User('orgId') orgId: number,
    @Body() cancelBookingDto: CancelBookingDto,
  ) {
    return this.appointmentsService.cancelBooking(+id, cancelBookingDto, orgId);
  }

  @Patch(':id/complete')
  @Role(Roles.org, Roles.member)
  @ApiOperation({ summary: 'Mark as complete booking by org or member' })
  completeBooking(@Param('id') id: string, @User('orgId') orgId: number) {
    return this.appointmentsService.completeBooking(+id, orgId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete booking by org or member' })
  @Role(Roles.org, Roles.member)
  remove(@Param('id') id: string, @User('orgId') orgId: number) {
    return this.appointmentsService.remove(+id, orgId);
  }
}
