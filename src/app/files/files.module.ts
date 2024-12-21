import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './entities/file.entity';
// import { FileQueue } from './file.queue';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'FileQueue' }),
    TypeOrmModule.forFeature([File]),
  ],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
