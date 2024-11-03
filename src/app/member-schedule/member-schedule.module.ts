import { Module } from '@nestjs/common';
import { MemberScheduleService } from './member-schedule.service';
import { MemberScheduleController } from './member-schedule.controller';

@Module({
  controllers: [MemberScheduleController],
  providers: [MemberScheduleService],
})
export class MemberScheduleModule {}
