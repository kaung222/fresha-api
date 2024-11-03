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
import { User } from '@/security/user.decorator';

@Controller('member-schedule')
export class MemberScheduleController {
  constructor(private readonly memberScheduleService: MemberScheduleService) {}

  @Post()
  create(@Body() createMemberScheduleDto: CreateMemberScheduleDto) {
    return this.memberScheduleService.create(createMemberScheduleDto);
  }

  @Get()
  findAll(@User('orgId') orgId: number) {
    return this.memberScheduleService.findAll(orgId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.memberScheduleService.findOne(+id);
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
