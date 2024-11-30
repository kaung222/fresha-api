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
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@/security/role.decorator';
import { Roles, User } from '@/security/user.decorator';
import { GetAvailableTimes } from './dto/get-available-time.dto';
import { GetAppointmentDto } from './dto/get-appointments.dto';

@Controller('members')
@ApiTags('Member')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @Role(Roles.org)
  create(
    @Body() createMemberDto: CreateMemberDto,
    @User('orgId') orgId: number,
  ) {
    return this.membersService.create(createMemberDto, orgId);
  }

  @Get()
  @Role(Roles.org)
  findAll(@User('orgId') orgId: number) {
    return this.membersService.findAll(orgId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(+id);
  }

  @Get(':id/profile')
  @Role(Roles.org, Roles.member)
  getProfile(@User('id') id: number) {
    return this.membersService.getProfile(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMemberDto: UpdateMemberDto,
    @User('orgId') orgId: number,
  ) {
    return this.membersService.update(+id, updateMemberDto, orgId);
  }

  @Get(':id/available-times')
  getAvailableTimeSlots(
    @Param('id') memberId: number,
    @Query() getTimes: GetAvailableTimes,
  ) {
    // return this.membersService.getAvailableTimeSlots(memberId, getTimes);
  }

  @Get(':id/appointments')
  getAppointments(
    @Param('id') memberId: number,
    @Query() getAppointmentDto: GetAppointmentDto,
  ) {
    // return this.membersService.getAppointments(memberId, getAppointmentDto);
  }

  @Get(':id/reviews')
  getReviews(
    @Param('id') memberId: number,
    @Query() getAppointmentDto: GetAppointmentDto,
  ) {
    // return this.membersService.getAppointments(memberId, getAppointmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User('orgId') orgId: number) {
    return this.membersService.remove(+id, orgId);
  }

  @Get(':id/restore')
  restore(@Param('id') id: string, @User('orgId') orgId: number) {
    return this.membersService.restore(+id);
  }
}
