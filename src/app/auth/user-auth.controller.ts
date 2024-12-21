import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';
import { UserAuthService } from './user-auth.service';
import { Response } from 'express';
import { LoginWithGoogle, RegisterUserDto } from './dto/register-user.dto';

@Controller('auth')
@ApiTags('User auth')
export class UserAuthController {
  constructor(private readonly userAuthService: UserAuthService) {}
  @Post('user-login')
  async loginUser(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    const { refreshToken, ...rest } =
      await this.userAuthService.loginUser(loginUserDto);
    this.userAuthService.setCookieHeaders(res, refreshToken);
    res.send({ ...rest }).status(200);
  }

  @Post('google-login')
  async loginWithProvider(
    @Body() loginUserDto: LoginWithGoogle,
    @Res() res: Response,
  ) {
    const { refreshToken, ...rest } =
      await this.userAuthService.loginWithProvider(loginUserDto.token);
    this.userAuthService.setCookieHeaders(res, refreshToken);
    res.send({ ...rest }).status(200);
  }

  @Post('user-register')
  async registerUser(
    @Body() registerUserDto: RegisterUserDto,
    @Res() res: Response,
  ) {
    const { refreshToken, ...rest } =
      await this.userAuthService.registerUser(registerUserDto);
    this.userAuthService.setCookieHeaders(res, refreshToken);
    res.send({ ...rest }).status(200);
  }
}
