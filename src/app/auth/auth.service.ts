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
import { Member } from '../members/entities/member.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Roles } from '@/security/user.decorator';
import { ConfigService } from '@nestjs/config';
import { CreatePasswordDto } from './dto/create-password.dto';
import { Response } from 'express';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { SendEmailDto } from '@/global/email.service';
import { generateOpt } from '@/utils';
import { OTP } from './entities/otp.entity';
import { ConfirmOTPDto } from './dto/confirm-otp.dto';
import { RegisterOrganizationDto } from './dto/create-org.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectQueue('send-email') private readonly emailQueue: Queue,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(OTP) private otpRepository: Repository<OTP>,
  ) {}

  // login organization and member

  async loginOrganization(loginOrgDto: loginOrganizationDto) {
    const member = await this.memberRepository
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.organization', 'organization')
      .addSelect('member.password')
      .where('member.email=:email', { email: loginOrgDto.email })
      .getOne();
    if (!member) throw new NotFoundException('email not found');
    if (member && member.password == null)
      throw new ForbiddenException(
        'Please accept the invitation in your email',
      );
    const isAuthenticated = await this.checkPassword(
      loginOrgDto.password,
      member.password,
    );
    if (!isAuthenticated) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const { password, ...rest } = member;
    const jwtPayload = {
      user: { id: member.id, role: member.role, orgId: member.organization.id },
    };
    const { accessToken, refreshToken } = this.generateTokens(jwtPayload);
    return {
      message: 'Login successfully',
      accessToken,
      refreshToken,
      user: rest,
    };
  }
  // register new organization
  async createOrganization(createOrganization: RegisterOrganizationDto) {
    const { name, types, address, email, firstName, lastName } =
      createOrganization;
    const isConfirmedOTP = await this.otpRepository.findOneBy({ email });
    if (!isConfirmedOTP || !isConfirmedOTP.isConfirmed)
      throw new ForbiddenException('Confirm OTP first');
    const newOrg = this.organizationRepository.create({ name, types, address });
    const organization = await this.organizationRepository.save(newOrg);
    const password = await this.hashPassword(createOrganization.password);
    const newMember = this.memberRepository.create({
      email,
      firstName,
      lastName,
      password,
      role: Roles.org,
      type: 'employee',
      organization,
    });
    const member = await this.memberRepository.save(newMember);

    const jwtPayload = {
      id: member.id,
      role: Roles.org,
      orgId: organization.id,
    };
    delete member.password;
    const { accessToken, refreshToken } = this.generateTokens(jwtPayload);
    return {
      message: 'Create organization successfully',
      accessToken,
      refreshToken,
      user: member,
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
    const isExistOtp = await this.otpRepository.findOneBy({
      email,
    });
    if (isExistOtp) {
      await this.otpRepository.update(isExistOtp.id, otpPayload);
    } else await this.otpRepository.insert(otpPayload);
    const emailPayload: SendEmailDto = {
      to: email,
      text: otp,
      subject: 'OTP',
    };
    await this.emailQueue.add('sendEmail', emailPayload);
    return {
      message: `Send OTP to ${email} successfully`,
      email,
    };
  }

  // confirmOTP
  async confirmOTP(confirmOTPDto: ConfirmOTPDto) {
    const { email, otp } = confirmOTPDto;
    const storedOtp = await this.otpRepository.findOneBy({ email });

    if (
      !storedOtp ||
      storedOtp.otp !== otp.toString() ||
      parseInt(storedOtp.expiredAt) <= Date.now()
    ) {
      throw new UnauthorizedException('Invalid OTP or expired!');
    }
    await this.otpRepository.update(storedOtp.id, { isConfirmed: true });
    return {
      message: 'Confirm OTP successfully',
    };
  }

  // create password for new member added
  async createPassword(createPasswordDto: CreatePasswordDto) {
    const { email } = createPasswordDto;
    const member = await this.memberRepository.findOneByOrFail({
      email,
      password: null,
    });
    if (!member) throw new NotFoundException();
    const password = await this.hashPassword(createPasswordDto.password);
    await this.memberRepository.update(member.id, { password });
    const { accessToken, refreshToken } = this.generateTokens({
      org: member.organization.id,
      user: { role: Roles.member, id: member.id },
    });
    return {
      message: 'Create password successfully please login',
      accessToken,
      refreshToken,
    };
  }

  getNewAccessToken(token: string) {
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
    const accessToken = this.jwtService.sign(
      payload,
      //  { expiresIn: '1h' }
    );
    const refreshToken = this.jwtService.sign(
      { data: payload },
      // { expiresIn: '7d' },
      { secret: this.configService.get('JWT_REFRESH_SECRET') },
    );
    return { accessToken, refreshToken };
  }

  // hash password
  async hashPassword(payload: string): Promise<string> {
    // const salt = bcrypt.genSalt()
    const hash = await bcrypt.hash(payload, 10);
    console.log(hash);
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
    res.cookie('refreshToken', refreshToken, {
      secure: true,
      httpOnly: true,
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });
  }
  // Helper function to extract the refresh token from the cookie
  getRefreshTokenFromCookie(cookie: string): string | null {
    const refreshTokenMatch = cookie
      .split(';')
      .find((c) => c.trim().startsWith('refreshToken='));
    return refreshTokenMatch ? refreshTokenMatch.split('=')[1] : null;
  }
}
