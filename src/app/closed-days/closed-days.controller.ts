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
import { ClosedDaysService } from './closed-days.service';
import { CreateClosedDayDto } from './dto/create-closed-day.dto';
import { UpdateClosedDayDto } from './dto/update-closed-day.dto';
import { Role } from '@/security/role.decorator';
import { Roles, User } from '@/security/user.decorator';
import { GetClosedDay } from './dto/get-close-days.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('closed-days')
@Role(Roles.org)
export class ClosedDaysController {
  constructor(private readonly closedDaysService: ClosedDaysService) {}

  @Post()
  create(
    @Body() createClosedDayDto: CreateClosedDayDto,
    @User('orgId') orgId: number,
  ) {
    return;
    return this.closedDaysService.create(createClosedDayDto, orgId);
  }

  @Get()
  @ApiOperation({ summary: 'Get closed days by org' })
  findAll(@User('orgId') orgId: number, @Query() getClosedDay: GetClosedDay) {
    return this.closedDaysService.findAll(orgId, getClosedDay);
  }

  @Get('formatted-closed-days')
  fomattedClosedDays(@User('orgId') orgId: number) {
    return this.closedDaysService.getFormattedcloseDay(orgId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete closed day by org' })
  remove(@Param('id') id: string, @User('orgId') orgId: number) {
    return this.closedDaysService.remove(+id, orgId);
  }
}
