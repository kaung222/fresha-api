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
import { Test } from './app/test/entities/test.entity';
import { Product } from './app/products/entities/product.entity';
import { MemberScheduleModule } from './app/member-schedule/member-schedule.module';
import { MemberSchedule } from './app/member-schedule/entities/member-schedule.entity';
import { OrgScheduleModule } from './app/org-schedule/org-schedule.module';
import { BreakTime } from './app/member-schedule/entities/break-time.entity';
import { OrgSchedule } from './app/org-schedule/entities/org-schedule.entity';
import { NotificationsModule } from './app/notifications/notifications.module';
import { Notification } from './app/notifications/entities/notification.entity';
import { StatisticsModule } from './app/statistics/statistics.module';
import { ClosedDaysModule } from './app/closed-days/closed-days.module';
import { ClosedDay } from './app/closed-days/entities/closed-day.entity';
import { LeavesModule } from './app/leaves/leaves.module';
import { Leave } from './app/leaves/entities/leave.entity';
import { PublicationModule } from './app/publication/publication.module';
import { BrandsModule } from './app/brands/brands.module';
import { ProductCategoryModule } from './app/product-category/product-category.module';
import { Brand } from './app/brands/entities/brand.entity';
import { ProductCategory } from './app/product-category/entities/product-category.entity';
import { PaymentsModule } from './app/payments/payments.module';
import { Payment } from './app/payments/entities/payment.entity';
import { SalesModule } from './app/sales/sales.module';
import { Sale } from './app/sales/entities/sale.entity';
import { SaleItem } from './app/sales/entities/sale-item.entity';
import { TimeSlotsModule } from './app/time-slots/time-slots.module';
import { FeaturesModule } from './app/features/features.module';
import { BookingItem } from './app/appointments/entities/booking-item.entity';
import { EmailsModule } from './app/emails/emails.module';
import { OrgTypesModule } from './app/org-types/org-types.module';
import { OrgType } from './app/org-types/entities/org-type.entity';
import { AdminsModule } from './app/admins/admins.module';
import { Email } from './app/emails/entities/email.entity';
import { SearchModule } from './app/search/search.module';
import { FavouritesModule } from './app/favourites/favourites.module';
import { Favourite } from './app/favourites/entities/favourite.entity';
import { redisStore } from 'cache-manager-redis-store';
import { TokenSession } from './app/auth/entities/token.entity';
import { SubscriptionsModule } from './app/subscriptions/subscriptions.module';
import { PricingsModule } from './app/pricings/pricings.module';
import { Pricing } from './app/pricings/entities/pricing.entity';
import { Subscription } from './app/subscriptions/entities/subscription.entity';
import { Admin } from './app/admins/entities/admin.entity';

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
        Email,
        User,
        OTP,
        File,
        OrgReview,
        Client,
        Appointment,
        BookingItem,
        Test,
        Product,
        MemberSchedule,
        BreakTime,
        OrgSchedule,
        Notification,
        ClosedDay,
        Leave,
        OrgType,
        Brand,
        Payment,
        ProductCategory,
        Sale,
        SaleItem,
        Favourite,
        TokenSession,
        Admin,
        Pricing,
        Subscription,
      ],
    }),

    GlobalModule,
    ServicesModule,
    SearchModule,
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
        disconnectTimeout: 10,
      },
    }),
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
    MemberScheduleModule,
    OrgScheduleModule,
    NotificationsModule,
    StatisticsModule,
    ClosedDaysModule,
    LeavesModule,
    PublicationModule,
    BrandsModule,
    ProductCategoryModule,
    PaymentsModule,
    SalesModule,
    TimeSlotsModule,
    FeaturesModule,
    EmailsModule,
    OrgTypesModule,
    AdminsModule,
    FavouritesModule,
    SubscriptionsModule,
    PricingsModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
