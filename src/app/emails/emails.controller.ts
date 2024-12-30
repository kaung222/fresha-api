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
import { Role } from '@/security/role.decorator';
import { Roles, User } from '@/security/user.decorator';
import { ApiTags } from '@nestjs/swagger';
import { PaginateQuery } from '@/utils/paginate-query.dto';
import { CreateEmailByOrg } from './dto/create-email-by-org.dto';
import { SendEmailToAdmin } from './dto/send-email-to-admin';

@Controller('emails')
@ApiTags('Email')
@Role(Roles.org)
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  @Post()
  create(
    @User('orgId') orgId: number,
    @Body() createEmailDto: CreateEmailByOrg,
  ) {
    return this.emailsService.createByOrg(orgId, createEmailDto);
  }

  @Post('to/admins')
  sendEmailToAdmin(@Body() createEmailDto: SendEmailToAdmin) {
    return this.emailsService.sendEmailToAdmins(createEmailDto);
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
