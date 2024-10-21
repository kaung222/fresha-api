import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { loginOrganizationDto } from './dto/login-org.dto';
import { CreateRootUser } from './dto/register-org.dto';
import { CreateOrganizationDto } from '../organizations/dto/create-organization.dto';
import { Role } from '@/security/role.decorator';
import { Org, Roles, User } from '@/security/user.decorator';
import { Request, Response } from 'express';

@Controller('auth')
@ApiTags('Organization Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('member-login')
  @ApiOperation({ summary: 'Login as member or root user' })
  async login(@Body() loginOrgDto: loginOrganizationDto, @Res() res: Response) {
    const { refreshToken, ...rest } =
      await this.authService.loginOrganization(loginOrgDto);
    this.authService.setCookieHeaders(res, refreshToken);
    return { rest };
  }

  @Post('root-user')
  @Role(Roles.org)
  @ApiOperation({ summary: 'create root user' })
  register(
    @Body() createRootUser: CreateRootUser,
    @User('orgId') orgId: number,
  ) {
    return this.authService.createRootUser(createRootUser, orgId);
  }

  @Post('organization')
  @ApiOperation({ summary: 'create organization' })
  @Role(Roles.org)
  async createOrganization(
    createOrganization: CreateOrganizationDto,
    @Res() res: Response,
  ) {
    const { refreshToken, ...rest } =
      await this.authService.createOrganization(createOrganization);
    this.authService.setCookieHeaders(res, refreshToken);
    return { rest };
  }

  @Get('refresh')
  @Role(Roles.member, Roles.org, Roles.user)
  @ApiOperation({ summary: 'Get new access token when expired' })
  getNewAccessToken(@Req() req: Request, @Res() res: Response) {
    const cookie = req.headers.cookie;
    if (!cookie)
      throw new UnauthorizedException('Session expires, login again!');
    const token = this.authService.getRefreshTokenFromCookie(cookie);
    const tokens = this.authService.getNewAccessToken(token);
    this.authService.setCookieHeaders(res, tokens.refreshToken);
    res.send({ accessToken: tokens.accessToken });
  }
}
