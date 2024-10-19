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
      // autoLoadEntities: true,
      entities: [Member, Service, Organization,Category],
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
    CacheModule.register({ isGlobal: true }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    MembersModule,
    UsersModule,
    OrganizationsModule,
    AppointmentsModule,
    CategoriesModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
