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
  Member,
  MemberType,
  UserState,
} from '../members/entities/member.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Roles } from '@/security/user.decorator';
import { ConfigService } from '@nestjs/config';
import { CreatePasswordDto } from './dto/create-password.dto';
import { Response } from 'express';
import { generateOpt } from '@/utils';
import { OTP } from './entities/otp.entity';
import { ConfirmOTPDto } from './dto/confirm-otp.dto';
import { RegisterOrganizationDto } from './dto/create-org.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EmailsService } from '../emails/emails.service';
import { v4 as uuidv4 } from 'uuid';
import { CacheService } from '@/global/cache.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
    private emailService: EmailsService,
    private cacheService: CacheService,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(OTP) private otpRepository: Repository<OTP>,
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
    const jwtPayload = this.generateJwtPayload(member);
    const { accessToken, refreshToken } = this.generateTokens(jwtPayload);
    // update member state
    await this.memberRepository.update(member.id, { state: UserState.login });
    return {
      message: 'Login successfully',
      accessToken,
      refreshToken,
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
    await this.checkIsConfirm(email);
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
    });
    const member = await this.memberRepository.save(newMember);
    const jwtPayload = this.generateJwtPayload(member);
    const { accessToken, refreshToken } = this.generateTokens(jwtPayload);
    // event an event , to see more ==> org-schedule.service.ts
    this.eventEmitter.emit('organization.created', organization.id);
    return {
      message: 'Create organization successfully',
      accessToken,
      refreshToken,
    };
  }

  generateJwtPayload(member: Member) {
    return {
      id: member.id,
      role: Roles.org,
      orgId: member.orgId,
    };
  }
  // get OTP
  async getOTP(email: string) {
    const otp = generateOpt();
    const otpPayload = {
      otp,
      expiredAt: (Date.now() + 300000).toString(),
      email,
      isConfirmed: false,
    };
    const existingOtp = await this.otpRepository.findOneBy({
      email,
    });
    const createOtp = this.otpRepository.create({
      ...existingOtp,
      ...otpPayload,
    });
    await this.otpRepository.save(createOtp);
    // send email otp
    this.emailService.createWithoutSave({
      to: email,
      text: `Your OTP for fresha is <b>${otp}</b>.Dont share it anyone!`,
      subject: 'OTP',
      from: process.env.SHOP_GMAIL,
    });
    return {
      message: `Send OTP to ${email} successfully`,
      email,
    };
  }

  async logoutMember(memberId: string) {
    await this.memberRepository.update(
      { id: memberId },
      { state: UserState.logout },
    );
    return {
      message: 'logout successfully',
    };
  }

  async forgetPassword(email: string) {
    const member = await this.memberRepository.findOneBy({ email });
    if (!member) throw new NotFoundException('email not found');
    return await this.getOTP(email);
  }

  // confirmOTP
  async confirmOTP(confirmOTPDto: ConfirmOTPDto) {
    const { email, otp } = confirmOTPDto;
    await this.checkValidOTP(email, otp);
    await this.otpRepository.update({ email }, { isConfirmed: true });
    return {
      message: 'Confirm OTP successfully',
    };
  }

  async checkValidOTP(email: string, otp: string) {
    const storedOtp = await this.otpRepository.findOneBy({ email });
    if (
      !storedOtp ||
      storedOtp.otp !== otp.toString() ||
      parseInt(storedOtp.expiredAt) <= Date.now()
    ) {
      throw new UnauthorizedException('Invalid OTP or expired!');
    }
    return true;
  }

  async checkIsConfirm(email: string) {
    const otp = await this.otpRepository.findOneBy({ email });
    if (!otp || !otp.isConfirmed)
      throw new UnauthorizedException('Confirm OTP first!');
    if (parseInt(otp.expiredAt) <= Date.now()) {
      throw new UnauthorizedException('OTP session ended!');
    }
    return true;
  }

  // create password for new member added
  async createPassword(createPasswordDto: CreatePasswordDto) {
    const { email } = createPasswordDto;
    await this.checkIsConfirm(email);
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

  // generate accessToken and refreshToken
  generateTokens(payload: any) {
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });
    return { accessToken, refreshToken };
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

  //set refresh token cookie in response headers
  setCookieHeaders(res: Response, refreshToken: string) {
    const sessionId = uuidv4();
    this.cacheService.set(sessionId, refreshToken, 7 * 24 * 60 * 60 * 1000);
    return res.cookie('sessionId', sessionId, {
      sameSite: 'lax',
      secure: true,
      httpOnly: true,
      expires: refreshToken
        ? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        : new Date(0),
    });
  }
  // Helper function to extract the refresh token from the cookie
  getSessionIdFromCookie(cookie: string): string | null {
    const sessionId = cookie
      .split(';')
      .find((c) => c.trim().startsWith('sessionId='));
    return sessionId ? sessionId.split('=')[1] : null;
  }
}
