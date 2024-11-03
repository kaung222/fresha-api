import { Module } from '@nestjs/common';
import { MemberScheduleService } from './member-schedule.service';
import { MemberScheduleController } from './member-schedule.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberSchedule } from './entities/member-schedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MemberSchedule])],
  controllers: [MemberScheduleController],
  providers: [MemberScheduleService],
})
export class MemberScheduleModule {}
