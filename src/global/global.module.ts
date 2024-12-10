import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CacheService } from './cache.service';
import { EmailsService } from '@/app/emails/emails.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Email } from '@/app/emails/entities/email.entity';
import { EmailQueue } from '@/app/emails/email.queue';
import { BullModule } from '@nestjs/bull';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Email]),
    BullModule.registerQueue({ name: 'emailQueue' }),
  ],
  providers: [CacheService, EmailsService],
  exports: [CacheService, EmailsService],
})
export class GlobalModule {}
