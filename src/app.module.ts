import { Module } from '@nestjs/common';
import { GlobalModule } from './global/global.module';
import { ServicesModule } from './app/services/services.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { MembersModule } from './app/members/members.module';
import { Member } from './app/members/entities/member.entity';
import { Service } from './app/services/entities/service.entity';
import { UsersModule } from './app/users/users.module';
import { OrganizationsModule } from './app/organizations/organizations.module';
import { AppointmentsModule } from './app/appointments/appointments.module';
import { CategoriesModule } from './app/categories/categories.module';
import { Organization } from './app/organizations/entities/organization.entity';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './security/role.guard';
import { AuthModule } from './app/auth/auth.module';
import { Category } from './app/categories/entities/category.entity';
import { FilesModule } from './app/files/files.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { User } from './app/users/entities/user.entity';
import { ProductsModule } from './app/products/products.module';
import { TestModule } from './app/test/test.module';
import { OTP } from './app/auth/entities/otp.entity';
import { BullModule } from '@nestjs/bull';
import { File } from './app/files/entities/file.entity';
import { MemberReviewsModule } from './app/member-reviews/member-reviews.module';
import { OrgReviewsModule } from './app/org-reviews/org-reviews.module';
import { BranchModule } from './app/branch/branch.module';
import { ClientsModule } from './app/clients/clients.module';
import { OrgReview } from './app/org-reviews/entities/org-review.entity';
import { Client } from './app/clients/entities/client.entity';
import { Appointment } from './app/appointments/entities/appointment.entity';
import { ServiceAppointment } from './app/appointments/entities/serviceappointment.entity';
import { Test } from './app/test/entities/test.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process?.env.MYSQL_HOST,
      port: +process?.env.MYSQL_PORT,
      username: process?.env.MYSQL_USER,
      password: process?.env.MYSQL_PASSWORD,
      database: process?.env.MYSQL_DATABASE,
      synchronize: true,
      logging: true,
      retryAttempts: 3,
      // autoLoadEntities: true,
      entities: [
        Member,
        Service,
        Organization,
        Category,
        User,
        OTP,
        File,
        OrgReview,
        Client,
        Appointment,
        ServiceAppointment,
        Test,
      ],
    }),

    GlobalModule,
    ServicesModule,
    JwtModule.register({ secret: process.env.JWT_SECRET, global: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 10,
      },
    ]),
    MailerModule.forRoot({
      transport: {
        service: 'Gmail',
        auth: {
          user: process.env.SHOP_GMAIL,
          pass: process.env.SHOP_GMAIL_PASSWORD,
        },
      },
    }),
    BullModule.forRoot({
      redis: {
        port: parseInt(process.env.REDIS_PORT),
        host: process.env.REDIS_HOST,
        password: process.env.REDIS_PASSWORD,
      },
    }),
    CacheModule.register({ isGlobal: true }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    MembersModule,
    UsersModule,
    OrganizationsModule,
    AppointmentsModule,
    CategoriesModule,
    AuthModule,
    FilesModule,
    ProductsModule,
    TestModule,
    MemberReviewsModule,
    OrgReviewsModule,
    BranchModule,
    ClientsModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
