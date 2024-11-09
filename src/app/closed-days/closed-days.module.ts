import { Module } from '@nestjs/common';
import { ClosedDaysService } from './closed-days.service';
import { ClosedDaysController } from './closed-days.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClosedDay } from './entities/closed-day.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClosedDay])],
  controllers: [ClosedDaysController],
  providers: [ClosedDaysService],
})
export class ClosedDaysModule {}
