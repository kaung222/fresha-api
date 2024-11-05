import { Module } from '@nestjs/common';
import { OrgScheduleService } from './org-schedule.service';
import { OrgScheduleController } from './org-schedule.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrgSchedule } from './entities/org-schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrgSchedule])],
  controllers: [OrgScheduleController],
  providers: [OrgScheduleService],
})
export class OrgScheduleModule {}
