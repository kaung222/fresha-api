import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { EmailsService } from './emails.service';
import { CreateEmailDto } from './dto/crearte-email.dto';
import { Role } from '@/security/role.decorator';
import { Roles, User } from '@/security/user.decorator';
import { ApiTags } from '@nestjs/swagger';
import { PaginateQuery } from '@/utils/paginate-query.dto';

@Controller('emails')
@ApiTags('Email')
@Role(Roles.org)
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  @Post()
  create(@User('orgId') orgId: number, @Body() createEmailDto: CreateEmailDto) {
    return this.emailsService.create(orgId, createEmailDto);
  }

  @Get()
  findAll(@User('orgId') orgId: number, @Query() paginateQuery: PaginateQuery) {
    return this.emailsService.findAll(orgId, paginateQuery);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User('orgId') orgId: number) {
    return this.emailsService.remove(id, orgId);
  }
}
