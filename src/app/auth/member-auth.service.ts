import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { loginOrganizationDto } from './dto/login-org.dto';
import { Repository } from 'typeorm';

import { Member } from '../members/entities/member.entity';

import { InjectRepository } from '@nestjs/typeorm';

import { AuthService } from './auth.service';

@Injectable()
export class MemberAuthService {
  constructor(
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    private readonly authService: AuthService,
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
    const isAuthenticated = await this.authService.checkPassword(
      password,
      member.password,
    );
    if (!isAuthenticated) {
      throw new UnauthorizedException('Invalid email or password');
    }
    // generate tokens
    const { accessToken, refreshToken } =
      this.authService.generateTokens(member);
    // save token in db
    const sessionId = await this.authService.saveToken(refreshToken, member.id);
    return {
      message: 'Login successfully',
      accessToken,
      sessionId,
    };
  }
}
