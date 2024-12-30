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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@/security/role.decorator';
import { Roles, User } from '@/security/user.decorator';
import { PaginateQuery } from '@/utils/paginate-query.dto';

@Controller('users')
@ApiTags('User')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  // @Role(Roles.member, Roles.org)
  findAll(@Query() paginateQuery: PaginateQuery) {
    return this.usersService.findAll(paginateQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  @Get('info/profile')
  @Role(Roles.user)
  @ApiOperation({ summary: 'Get my profile' })
  getProfile(@User('id') id: string) {
    return this.usersService.getProfile(id);
  }

  @Get(':id/appointments')
  @ApiOperation({ summary: 'Get my profile' })
  getMyAppointments(@User('id') id: string, @Query('page') page: number) {
    return this.usersService.getMyAppointments(id, page);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'update my profile' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete account' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
