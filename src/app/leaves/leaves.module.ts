import { Module } from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { LeavesController } from './leaves.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Leave } from './entities/leave.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Leave])],
  controllers: [LeavesController],
  providers: [LeavesService],
})
export class LeavesModule {}
