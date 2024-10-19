import {
  ConflictException,
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

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
  ) {}

  // login organization
  async loginOrganization(loginOrgDto: loginOrganizationDto) {
    const member = await this.memberRepository
      .createQueryBuilder('member')
      .addSelect('member.password', 'password')
      .where('member.email=:email', { email: loginOrgDto.email })
      .getOne();
    if (!member) throw new NotFoundException('email not found');
    const isAuthenticated = await bcrypt.compare(
      loginOrgDto.password,
      member.password,
    );
    if (!isAuthenticated) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const { password, ...rest } = member;
    const jwtPayload = {
      user: { id: member.id, role: member.role },
      sub: member.organization.id,
    };
    const { accessToken, refreshToken } = this.generateTokens(jwtPayload);
    return {
      message: 'Login successfully',
      accessToken,
      refreshToken,
      user: rest,
    };
  }

  // register org
  async createRootUser(createRootUser: CreateRootUser) {
    const { email } = createRootUser;
    const member = await this.memberRepository.findOneBy({ email });
    if (member) throw new ConflictException('Email already taken');
    const newMember = this.memberRepository.create({
      ...createRootUser,
      role: Roles.org,
      type: 'self-employed',
    });
    const user = await this.memberRepository.save(newMember);
    const jwtPayload = {
      user: { id: user.id, role: user.role },
    };
    const { accessToken, refreshToken } = this.generateTokens(jwtPayload);
    return {
      messsage: 'Register successfully',
      accessToken,
      refreshToken,
    };
  }

  async createOrganization(
    createOrganization: CreateOrganizationDto,
    userId: number,
  ) {
    const newOrg = this.organizationRepository.create(createOrganization);
    const organization = await this.organizationRepository.save(newOrg);
    await this.memberRepository.save({ id: userId, organization });
    const jwtPayload = {
      user: { id: userId, role: Roles.org },
      org: organization.id,
    };
    const { accessToken, refreshToken } = this.generateTokens(jwtPayload);
    return {
      message: 'Create organization successfully',
      accessToken,
      refreshToken,
      organization,
    };
  }

  getNewAccessToken(token: string) {
    try {
      const { exp, iat, ...rest } = this.jwtService.verify(token);
      const { accessToken, refreshToken } = this.generateTokens(rest);
      return { accessToken, refreshToken };
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  private generateTokens(payload: any) {
    const accessToken = this.jwtService.sign(
      payload,
      //  { expiresIn: '1h' }
    );
    const refreshToken = this.jwtService.sign(
      { data: payload },
      // { expiresIn: '7d' },
      // {secret: }
    );
    return { accessToken, refreshToken };
  }

  private async hashPassword(payload: string): Promise<string> {
    // const salt = bcrypt.genSalt()
    const hash = await bcrypt.hash(payload, 10);
    console.log(hash);
    return hash;
  }
}
