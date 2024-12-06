import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EmailService } from './email.service';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [],
  providers: [CacheService, EmailService],
  exports: [CacheService, EmailService],
})
export class GlobalModule {}
