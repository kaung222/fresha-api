import { Controller, Get, Param, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { ApiTags } from '@nestjs/swagger';
import { GetStatisticsDto } from './dto/get-statistics.dto';

@Controller('statistics')
@ApiTags('Statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('member/:memberId')
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

  @Get()
  Test() {}
}
