import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@/security/role.decorator';
import { Roles, User } from '@/security/user.decorator';

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
  findAll() {
    return this.membersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.membersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
    return this.membersService.update(+id, updateMemberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.membersService.remove(+id);
  }

  @Get(':id/restore')
  restore(@Param('id') id: string) {
    return this.membersService.remove(+id);
  }
}
