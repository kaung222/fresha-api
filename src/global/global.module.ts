import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CacheService } from './cache.service';
import { EmailsService } from '@/app/emails/emails.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Email } from '@/app/emails/entities/email.entity';
import { BullModule } from '@nestjs/bull';
import { File } from '@/app/files/entities/file.entity';
import { FilesService } from '@/app/files/files.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Email, File]),
    BullModule.registerQueue({ name: 'emailQueue' }),
  ],
  providers: [CacheService, EmailsService, FilesService],
  exports: [CacheService, EmailsService, FilesService],
})
export class GlobalModule {}
