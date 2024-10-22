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
import { Roles, User } from '@/security/user.decorator';
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
    res.send({ ...rest }).status(200);
  }

  @Post('root-user')
  @Role(Roles.org)
  @ApiOperation({ summary: 'create root user' })
  async register(
    @Body() createRootUser: CreateRootUser,
    @User('orgId') orgId: number,
    @Res() res: Response,
  ) {
    const { refreshToken, ...rest } = await this.authService.createRootUser(
      createRootUser,
      orgId,
    );
    this.authService.setCookieHeaders(res, refreshToken);
    res.send({ ...rest }).status(200);
  }

  @Post('organization')
  @ApiOperation({ summary: 'create organization' })
  async createOrganization(
    @Body() createOrganization: CreateOrganizationDto,
    @Res() res: Response,
  ) {
    const { refreshToken, ...rest } =
      await this.authService.createOrganization(createOrganization);
    this.authService.setCookieHeaders(res, refreshToken);
    res.send({ ...rest }).status(200);
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
