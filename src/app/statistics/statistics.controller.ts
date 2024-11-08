import { Controller } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('statistics')
@ApiTags('Statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}
}
