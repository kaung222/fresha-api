import { Module } from '@nestjs/common';
import { OrgTypesService } from './org-types.service';
import { OrgTypesController } from './org-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrgType } from './entities/org-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrgType])],
  controllers: [OrgTypesController],
  providers: [OrgTypesService],
})
export class OrgTypesModule {}
