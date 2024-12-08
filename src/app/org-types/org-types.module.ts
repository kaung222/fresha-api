import { Module } from '@nestjs/common';
import { OrgTypesService } from './org-types.service';
import { OrgTypesController } from './org-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrgType } from './entities/org-type.entity';
import { FilesService } from '../files/files.service';
import { File } from '../files/entities/file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrgType, File])],
  controllers: [OrgTypesController],
  providers: [OrgTypesService, FilesService],
})
export class OrgTypesModule {}
