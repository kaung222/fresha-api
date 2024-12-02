import { Controller, Get, Param, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetStatisticsDto } from './dto/get-statistics.dto';
import { Roles, User } from '@/security/user.decorator';
import { Role } from '@/security/role.decorator';

@Controller('statistics')
@ApiTags('Statistics')
@Role(Roles.org)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  @ApiOperation({ summary: 'Get org appointment statistics' })
  getSatistics(
    @User('orgId') orgId: number,
    @Query() getStatisticsDto: GetStatisticsDto,
  ) {
    return this.statisticsService.getOrgAppointmentStatistics(
      orgId,
      getStatisticsDto,
    );
  }
  @Get('member/:memberId')
  @ApiOperation({ summary: 'Get org member statistics' })
  getMemberStatistics(
    @Param('memberId') memberId: number,
    @Query() getStatisticsDto: GetStatisticsDto,
  ) {
    // return this.statisticsService.getMemberChart(memberId, getStatisticsDto);
    return this.statisticsService.getMemberStatistics(
      memberId,
      getStatisticsDto,
    );
  }

  @Get('members')
  @ApiOperation({ summary: 'Get org most worked member statistics' })
  gerMVPMemeber(
    @User('orgId') orgId: number,
    @Query() getStatisticsDto: GetStatisticsDto,
  ) {
    return this.statisticsService.getMVPOfMonth(orgId, getStatisticsDto);
  }

  @Get('services')
  @ApiOperation({ summary: 'Get org most ordered service statistics' })
  getMostBookingServices(
    @User('orgId') orgId: number,
    @Query() getStatisticsDto: GetStatisticsDto,
  ) {
    return this.statisticsService.getMostBookingServices(
      orgId,
      getStatisticsDto,
    );
  }
}
