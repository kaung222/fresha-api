import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { loginOrganizationDto } from './dto/login-org.dto';
import { Repository } from 'typeorm';
import { Organization } from '../organizations/entities/organization.entity';
import {
  CommissionFeesType,
  Member,
  MemberType,
} from '../members/entities/member.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Roles } from '@/security/user.decorator';
import { ConfigService } from '@nestjs/config';
import { CreatePasswordDto } from './dto/create-password.dto';
import { Response } from 'express';
import { ConfirmOTPDto } from './dto/confirm-otp.dto';
import { RegisterOrganizationDto } from './dto/create-org.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EmailsService } from '../emails/emails.service';
import { CacheService } from '@/global/cache.service';
import { TokenSession } from './entities/token.entity';
import { decryptToken } from '@/utils/test';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
    private emailService: EmailsService,
    private cacheService: CacheService,
    @InjectRepository(TokenSession)
    private readonly tokenRepository: Repository<TokenSession>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  // login organization and member

  async loginOrganization(loginOrgDto: loginOrganizationDto) {
    const { email, password } = loginOrgDto;
    // get member by email
    const member = await this.memberRepository
      .createQueryBuilder('member')
      .addSelect('member.password')
      .where('member.email=:email', { email })
      .getOne();
    if (!member) throw new NotFoundException('email not found');
    // check passowrd
    const isAuthenticated = await this.checkPassword(password, member.password);
    if (!isAuthenticated) {
      throw new UnauthorizedException('Invalid email or password');
    }
    // generate tokens
    const { accessToken, refreshToken } = this.getTokens(member);
    // save token in db
    const sessionId = await this.saveToken(refreshToken, member.id);
    return {
      message: 'Login successfully',
      accessToken,
      sessionId,
    };
  }

  async checkExistEmail(email: string) {
    const member = await this.memberRepository
      .createQueryBuilder('member')
      .where('member.email=:email', { email })
      .addSelect('member.password')
      .getOne();
    if (!member) return await this.getOTP(email);
    if (member && member.password) return { message: 'login', password: true };
    await this.getOTP(email);
    return { message: 'create_password', password: false, email };
  }
  // register new organization
  async createOrganization(createOrganization: RegisterOrganizationDto) {
    const { name, email, firstName, lastName } = createOrganization;
    const isExisting = await this.memberRepository.findOneBy({ email });
    if (isExisting) throw new ConflictException('Email already taken');
    const newOrg = this.organizationRepository.create({ name, email });
    const organization = await this.organizationRepository.save(newOrg);
    const password = await this.hashPassword(createOrganization.password);
    const newMember = this.memberRepository.create({
      email,
      firstName,
      lastName,
      password,
      role: Roles.org,
      type: MemberType.self_employed,
      organization,
      commissionFees: 20,
      commissionFeesType: CommissionFeesType.percent,
    });
    const member = await this.memberRepository.save(newMember);
    const { accessToken, refreshToken } = this.getTokens(member);
    // event an event , to see more ==> org-schedule.service.ts
    this.eventEmitter.emit('organization.created', organization.id);
    const sessionId = await this.saveToken(refreshToken, member.id);
    return {
      message: 'Create organization successfully',
      accessToken,
      sessionId,
    };
  }

  getTokens(member: Member) {
    const jwtPayload = {
      id: member.id,
      role: Roles.org,
      orgId: member.orgId,
    };
    return this.generateTokens(jwtPayload);
  }
  // generate accessToken and refreshToken
  generateTokens(payload: any) {
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });
    return { accessToken, refreshToken };
  }
  // get OTP
  async getOTP(email: string) {
    // const organization = await this.organizationRepository.findOneBy({ email });
    return await this.emailService.sendOTPToEmail(email);
  }

  async logoutMember(sessionId: string, memberId: string) {
    await this.tokenRepository.delete({ id: sessionId, userId: memberId });
  }

  async forgetPassword(email: string) {
    const member = await this.memberRepository.findOneBy({ email });
    if (!member) throw new NotFoundException('email not found');
    return await this.getOTP(email);
  }

  // confirmOTP
  async confirmOTP(confirmOTPDto: ConfirmOTPDto) {
    return await this.emailService.confirmOTP(confirmOTPDto);
  }

  // create password for new member added
  async createPassword(createPasswordDto: CreatePasswordDto) {
    const { email } = createPasswordDto;
    const member = await this.memberRepository.findOneOrFail({
      where: { email },
      relations: { organization: true },
    });
    if (!member) throw new NotFoundException();
    const password = await this.hashPassword(createPasswordDto.password);
    await this.memberRepository.update(member.id, { password });
    return {
      message: 'Create password successfully please login',
    };
  }

  async getNewAccessToken(sessionId: string) {
    const token = await this.cacheService.get(sessionId);
    if (!token)
      throw new UnauthorizedException('Session expires, login again!');
    try {
      const { exp, iat, ...rest } = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
      const { accessToken, refreshToken } = this.generateTokens(rest);
      return { accessToken, refreshToken };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  // hash password
  async hashPassword(payload: string): Promise<string> {
    // const salt = bcrypt.genSalt()
    const salt = await bcrypt.genSaltSync(10);
    const hash = await bcrypt.hash(payload, salt);
    return hash;
  }

  // check correct password
  async checkPassword(
    password: string,
    password_stored: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, password_stored);
  }

  // refresh function
  async refresh(sessionId: string) {
    const session = await this.tokenRepository.findOneBy({ id: sessionId });
    const expired = session.expiredAt < new Date();
    if (!session || expired)
      throw new UnauthorizedException('Session expired, login again!');
    const token = decryptToken(session.token);
    const { exp, iat, ...rest } = this.jwtService.verify(token, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });
    const { refreshToken, accessToken } = this.generateTokens(rest);
    const newSessionId = await this.saveToken(refreshToken, rest.id);
    return { accessToken, sessionId: newSessionId };
  }

  // save session in db
  async saveToken(token: string, userId: string): Promise<string> {
    const createToken = this.tokenRepository.create({
      token,
      userId,
      expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    const session = await this.tokenRepository.save(createToken);
    return session.id;
  }

  //set refresh token cookie in response headers
  setCookieHeaders(res: Response, sessionId: string) {
    return res.cookie('oid', sessionId, {
      sameSite: 'lax',
      secure: true,
      httpOnly: true,
      expires: sessionId
        ? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        : new Date(0),
    });
  }

  // Helper function to extract the refresh token from the cookie
  getSessionIdFromCookie(cookie: string): string | null {
    const sessionId = cookie
      .split(';')
      .find((c) => c.trim().startsWith(`oid=`));
    return sessionId ? sessionId.split('=')[1] : null;
  }
}
