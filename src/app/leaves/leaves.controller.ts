import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { Role } from '@/security/role.decorator';
import { Roles } from '@/security/user.decorator';
import { CreateLeaveDto } from './dto/create-leave.dto';
import { UpdateLeaveDto } from './dto/update-leave.dto';

@Controller('leaves')
@Role(Roles.org)
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post()
  create(@Body() createleaveDto: CreateLeaveDto) {
    return this.leavesService.create(createleaveDto);
  }

  @Get()
  findAll() {
    return this.leavesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leavesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateleaveDto: UpdateLeaveDto) {
    return this.leavesService.update(+id, updateleaveDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leavesService.remove(+id);
  }
}
