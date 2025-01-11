import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';
import { UserAuthService } from './user-auth.service';
import { Request, Response } from 'express';
import { LoginWithGoogle, RegisterUserDto } from './dto/register-user.dto';
import { Roles, User } from '@/security/user.decorator';
import { AuthService } from './auth.service';
import { Role } from '@/security/role.decorator';

@Controller('auth')
@ApiTags('User auth')
export class UserAuthController {
  constructor(
    private readonly userAuthService: UserAuthService,
    private readonly authService: AuthService,
  ) {}
  @Post('user-login')
  async loginUser(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    const { sessionId, ...rest } =
      await this.userAuthService.loginUser(loginUserDto);
    this.userAuthService.setCookieHeaders(res, sessionId);
    res.send({ ...rest }).status(200);
  }

  @Post('google-login')
  async loginWithProvider(
    @Body() loginUserDto: LoginWithGoogle,
    @Res() res: Response,
  ) {
    const { sessionId, ...rest } = await this.userAuthService.loginWithProvider(
      loginUserDto.token,
    );
    this.userAuthService.setCookieHeaders(res, sessionId);
    res.send({ ...rest }).status(200);
  }

  @Post('user-register')
  async registerUser(
    @Body() registerUserDto: RegisterUserDto,
    @Res() res: Response,
  ) {
    const { sessionId, ...rest } =
      await this.userAuthService.registerUser(registerUserDto);
    this.userAuthService.setCookieHeaders(res, sessionId);
    res.send({ ...rest }).status(200);
  }

  @Get('refresh')
  // @Role( Roles.user)
  @ApiOperation({ summary: 'Get new access token when expired' })
  async getNewAccessToken(@Req() req: Request, @Res() res: Response) {
    const cookie = req.headers.cookie;
    const sessionId = this.userAuthService.getSessionIdFromCookie(cookie);
    if (!sessionId)
      throw new UnauthorizedException('Session expired, login again!');
    const tokens = await this.authService.refresh(sessionId);
    this.userAuthService.setCookieHeaders(res, tokens.sessionId);
    res.send({ accessToken: tokens.accessToken });
  }

  @Post('logout')
  @ApiOperation({ summary: 'logout user' })
  @Role(Roles.user)
  handleLogout(
    @Req() req: Request,
    @Res() res: Response,
    @User('id') userId: string,
  ) {
    const cookie = req.headers.cookie;
    const sessionId = this.userAuthService.getSessionIdFromCookie(cookie);
    if (!sessionId)
      return res.status(200).send({ message: 'Session expires, login again!' });
    this.authService.logout(sessionId, userId);
    this.userAuthService.setCookieHeaders(res, '');
    res.send({ message: 'logout successfully' });
  }
}
