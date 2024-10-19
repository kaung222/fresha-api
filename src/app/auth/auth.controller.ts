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
import { Org, Roles } from '@/security/user.decorator';
import { Request, Response } from 'express';

@Controller('auth')
@ApiTags('Organization Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('organization-login')
  @ApiOperation({ summary: 'Login as member or root user' })
  login(@Body() loginOrgDto: loginOrganizationDto) {
    return this.authService.loginOrganization(loginOrgDto);
  }

  @Post('organization-register')
  @ApiOperation({ summary: 'create root user' })
  register(@Body() createRootUser: CreateRootUser) {
    return this.authService.createRootUser(createRootUser);
  }

  @Post()
  @ApiOperation({ summary: 'create organization' })
  @Role(Roles.org)
  async createOrganization(
    createOrganization: CreateOrganizationDto,
    @Org() orgId: number,
  ) {
    const { refreshToken } = await this.authService.createOrganization(
      createOrganization,
      orgId,
    );
  }

  @Get('refresh')
  @Role(Roles.member, Roles.org, Roles.user)
  @ApiOperation({ summary: 'Get new access token when expired' })
  getNewAccessToken(@Req() req: Request, @Res() res: Response) {
    const cookie = req.headers.cookie;
    if (!cookie)
      throw new UnauthorizedException('Session expires, login again!');
    const token = this.getRefreshTokenFromCookie(cookie);
    const tokens = this.authService.getNewAccessToken(token);
    this.setCookieHeaders(res, tokens.refreshToken);
    res.send({ accessToken: tokens.accessToken });
  }

  //set refresh token cookie in response headers
  private setCookieHeaders(res: Response, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      secure: true,
      httpOnly: true,
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });
  }
  // Helper function to extract the refresh token from the cookie
  private getRefreshTokenFromCookie(cookie: string): string | null {
    const refreshTokenMatch = cookie
      .split(';')
      .find((c) => c.trim().startsWith('refreshToken='));
    return refreshTokenMatch ? refreshTokenMatch.split('=')[1] : null;
  }
}
