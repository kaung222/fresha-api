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
import { GetEmailDto } from './dto/get-email.dot';

@Controller('emails')
@Role(Roles.org)
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  @Post()
  create(@User('orgId') orgId: number, @Body() createEmailDto: CreateEmailDto) {
    return this.emailsService.create(orgId, createEmailDto);
  }

  @Get()
  findAll(@User('orgId') orgId: number, @Query() getEmailDto: GetEmailDto) {
    return this.emailsService.findAll(orgId, getEmailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User('orgId') orgId: number) {
    return this.emailsService.remove(id, orgId);
  }
}
