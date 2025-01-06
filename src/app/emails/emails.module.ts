import { Module } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { EmailsController } from './emails.controller';
import { BullModule } from '@nestjs/bull';
import { EmailQueue } from './email.queue';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Email } from './entities/email.entity';
import { OTP } from '../auth/entities/otp.entity';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'emailQueue' }),
    TypeOrmModule.forFeature([Email, OTP]),
  ],
  controllers: [EmailsController],
  providers: [EmailsService, EmailQueue],
})
export class EmailsModule {}
