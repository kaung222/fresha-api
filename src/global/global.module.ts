import { BullModule } from '@nestjs/bull';
import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EmailService } from './email.service';

@Global()
@Module({
  imports: [BullModule.registerQueue({ name: 'emailQueue' })],
  providers: [EmailService],
  exports: [EmailService],
})
export class GlobalModule {}
