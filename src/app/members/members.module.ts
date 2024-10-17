import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { ServicesService } from '../services/services.service';
import { Service } from '../services/entities/service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Member, Service])],
  controllers: [MembersController],
  providers: [MembersService, ServicesService],
})
export class MembersModule {}
