import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserAuthController } from './user-auth.controller';
import { UserAuthService } from './user-auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from '../members/entities/member.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { TokenSession } from './entities/token.entity';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { Admin } from '../admins/entities/admin.entity';
import { AdminsService } from '../admins/admins.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member, Organization, User, TokenSession, Admin]),
  ],
  controllers: [AuthController, UserAuthController, AdminAuthController],
  providers: [
    AuthService,
    UserAuthService,
    UsersService,
    AdminAuthService,
    AdminsService,
  ],
})
export class AuthModule {}
