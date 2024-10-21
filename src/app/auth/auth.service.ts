import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { loginOrganizationDto } from './dto/login-org.dto';
import { CreateRootUser } from './dto/register-org.dto';
import { Repository } from 'typeorm';
import { Organization } from '../organizations/entities/organization.entity';
import { Member } from '../members/entities/member.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Roles } from '@/security/user.decorator';
import { CreateOrganizationDto } from '../organizations/dto/create-organization.dto';
import { ConfigService } from '@nestjs/config';
import { CreatePasswordDto } from './dto/create-password.dto';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  // login organization and member
  async loginOrganization(loginOrgDto: loginOrganizationDto) {
    const member = await this.memberRepository
      .createQueryBuilder('member')
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

  // create root user
  async createRootUser(createRootUser: CreateRootUser, orgId: number) {
    const { email } = createRootUser;
    const member = await this.memberRepository.findOneBy({ email });
    if (member) throw new ConflictException('Email already taken');
    const password = await this.hashPassword(createRootUser.password);
    const newMember = this.memberRepository.create({
      ...createRootUser,
      role: Roles.org,
      type: 'self-employed',
      organization: { id: orgId },
      password,
    });
    const user = await this.memberRepository.save(newMember);
    const jwtPayload = {
      user: { id: user.id, role: user.role, orgId },
    };
    const { accessToken, refreshToken } = this.generateTokens(jwtPayload);
    return {
      messsage: 'Register successfully',
      accessToken,
      refreshToken,
    };
  }

  // register new organization
  async createOrganization(createOrganization: CreateOrganizationDto) {
    const newOrg = this.organizationRepository.create(createOrganization);
    const organization = await this.organizationRepository.save(newOrg);
    const jwtPayload = {
      user: { role: Roles.org, orgId: organization.id },
    };
    const { accessToken, refreshToken } = this.generateTokens(jwtPayload);
    return {
      message: 'Create organization successfully',
      accessToken,
      refreshToken,
      organization,
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
