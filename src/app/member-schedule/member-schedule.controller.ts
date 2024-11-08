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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@/security/role.decorator';
import { UpdateMultiScheduleDto } from '../org-schedule/dto/update-many.dto';

@Controller('member-schedule')
@ApiTags('Member schedule')
@Role(Roles.org)
export class MemberScheduleController {
  constructor(private readonly memberScheduleService: MemberScheduleService) {}
  @Post()
  @ApiOperation({ summary: 'Create a single schedule' })
  create(
    @Body() createScheduleDto: CreateMemberScheduleDto,
    @User('orgId') orgId: number,
  ) {
    return this.memberScheduleService.create(createScheduleDto, orgId);
  }

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

  @Patch('update/multiple')
  @ApiOperation({ summary: 'Update mutiple schedule' })
  updateMany(
    @User('orgId') orgId: number,
    @Body() updateMultiScheduleDto: UpdateMultiScheduleDto,
  ) {
    return this.memberScheduleService.updateMany(orgId, updateMultiScheduleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.memberScheduleService.remove(+id);
  }
}
