import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CacheService } from './cache.service';
import { EmailsService } from '@/app/emails/emails.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Email } from '@/app/emails/entities/email.entity';
import { BullModule } from '@nestjs/bull';
import { File } from '@/app/files/entities/file.entity';
import { FilesService } from '@/app/files/files.service';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { OTP } from '@/app/auth/entities/otp.entity';
import { DefaultService } from './default.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Email, File, OTP]),
    BullModule.registerQueue({ name: 'emailQueue' }),
    CacheModule.register(),
    // CacheModule.registerAsync({
    //   useFactory: async () => {
    //     const store = await redisStore({
    //       socket: {
    //         host: 'redis-18859.c292.ap-southeast-1-1.ec2.cloud.redislabs.com',
    //         port: 18859,
    //       },
    //       password: process.env.REDIS_PASSWORD,
    //     });

    //     return {
    //       store: store as unknown as CacheStore,
    //       ttl: 3 * 60000, // 3 minutes (milliseconds)
    //     };
    //   },
    // }),
  ],
  providers: [CacheService, EmailsService, FilesService, DefaultService],
  exports: [CacheService, EmailsService, FilesService, DefaultService],
})
export class GlobalModule {}
