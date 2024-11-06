import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MemberScheduleService } from './member-schedule.service';
import { CreateMemberScheduleDto } from './dto/create-member-schedule.dto';
import { UpdateMemberScheduleDto } from './dto/update-member-schedule.dto';
import { Roles, User } from '@/security/user.decorator';
import { CreateBreakTimeDto } from './dto/create-breakTime.dto';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@/security/role.decorator';

@Controller('member-schedule')
@ApiTags('Member schedule')
export class MemberScheduleController {
  constructor(private readonly memberScheduleService: MemberScheduleService) {}

  @Get()
  findAll(@User('orgId') orgId: number) {
    return this.memberScheduleService.findAll(orgId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.memberScheduleService.findOne(+id);
  }

  @Post(':id/break-time')
  createBreakTime(
    @Param('id') id: string,
    @Body() createBreakTimeDto: CreateBreakTimeDto,
  ) {
    return this.memberScheduleService.createBreakTime(+id, createBreakTimeDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMemberScheduleDto: UpdateMemberScheduleDto,
  ) {
    return this.memberScheduleService.update(+id, updateMemberScheduleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.memberScheduleService.remove(+id);
  }
}
