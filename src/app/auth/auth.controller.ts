import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { loginOrganizationDto } from './dto/login-org.dto';
import { Role } from '@/security/role.decorator';
import { Roles } from '@/security/user.decorator';
import { Request, Response } from 'express';
import { ConfirmOTPDto } from './dto/confirm-otp.dto';
import { GetOTPDto } from './dto/get-otp.dto';
import { RegisterOrganizationDto } from './dto/create-org.dto';

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

  @Get('otp/:email')
  getOtp(@Param() getOtpDto: GetOTPDto) {
    return this.authService.getOTP(getOtpDto.email);
  }

  @Post('otp')
  confirmOTP(@Body() confirmOTPDto: ConfirmOTPDto) {
    return this.authService.confirmOTP(confirmOTPDto);
  }

  @Post('organization/register')
  @ApiOperation({ summary: 'Register organization' })
  async createOrganization(
    @Body() registerOrganization: RegisterOrganizationDto,
    @Res() res: Response,
  ) {
    const { refreshToken, ...rest } =
      await this.authService.createOrganization(registerOrganization);
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
