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
import { Request, Response } from 'express';
import { ConfirmOTPDto } from './dto/confirm-otp.dto';
import { GetOTPDto } from './dto/get-otp.dto';
import { RegisterOrganizationDto } from './dto/create-org.dto';
import { CreatePasswordDto } from './dto/create-password.dto';
import { CheckEmailDto } from './dto/check-email.dto';

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

  @Post('/check-email')
  @ApiOperation({ summary: 'Check existed email or not' })
  checkEmail(@Body() checkEamilDto: CheckEmailDto) {
    return this.authService.checkExistEmail(checkEamilDto.email);
  }

  @Get('otp/:email')
  getOtp(@Param() getOtpDto: GetOTPDto) {
    return this.authService.getOTP(getOtpDto.email);
  }

  @Post('otp/confirm')
  @ApiOperation({ summary: 'confirm otp' })
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
  // @Role(Roles.member, Roles.org, Roles.user)
  @ApiOperation({ summary: 'Get new access token when expired' })
  async getNewAccessToken(@Req() req: Request, @Res() res: Response) {
    const cookie = req.headers.cookie;
    const accessToken = req.headers.authorization.split(' ');

    if (!cookie || !accessToken)
      throw new UnauthorizedException('Session expires, login again!');
    const token = this.authService.getRefreshTokenFromCookie(cookie);
    const tokens = await this.authService.getNewAccessToken(token);
    this.authService.setCookieHeaders(res, tokens.refreshToken);
    res.send({ accessToken: tokens.accessToken });
  }

  @Post('forget-password')
  @ApiOperation({ summary: 'Get opt when forget password' })
  forgetPassword(@Body() { email }) {
    return this.authService.forgetPassword(email);
  }

  @Post('new-password')
  @ApiOperation({ summary: 'Create new password' })
  createNewPassword(@Body() createPassword: CreatePasswordDto) {
    return this.authService.createPassword(createPassword);
  }

  @Post('logout')
  @ApiOperation({ summary: 'logout member, user, and org' })
  handleLogout(@Req() req: Request, @Res() res: Response) {
    const cookie = req.headers.cookie;
    if (!cookie) return res.status(200).send({ message: 'Already logged out' });
    this.authService.setCookieHeaders(res, '');
    res.send({ message: 'logout successfully' });
  }
}
