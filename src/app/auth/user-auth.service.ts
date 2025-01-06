import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthService } from './auth.service';
import { Roles } from '@/security/user.decorator';
import { RegisterUserDto } from './dto/register-user.dto';
import { Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users/users.service';

@Injectable()
export class UserAuthService {
  constructor(
    private authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  // login user
  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new NotFoundException('User not found');
    if (!user.password)
      throw new UnauthorizedException('Please login with google');
    const isAuthenticated = await this.authService.checkPassword(
      password,
      user.password,
    );
    if (!isAuthenticated)
      throw new UnauthorizedException('Invalid email or password');
    const { accessToken, refreshToken } = this.getTokens(user);
    const sessionId = await this.authService.saveToken(refreshToken, user.id);
    return { accessToken, sessionId, user, message: 'login successfully' };
  }

  async loginWithProvider(token: string) {
    const oAuth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    try {
      const ticket = await oAuth2Client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID, // Specify the same client ID used in the strategy
      });
      const payload = ticket.getPayload();
      console.log(payload);
      let user = await this.userService.findOneByEmail(payload.email);
      if (!user)
        user = await this.userService.create({
          firstName: payload?.given_name,
          lastName: payload?.family_name,
          email: payload?.email,
          profilePicture: payload?.picture,
        });
      const { accessToken, refreshToken } = this.getTokens(user);
      const sessionId = await this.authService.saveToken(refreshToken, user.id);
      return { accessToken, sessionId, user };
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid access token');
    }
  }

  private getTokens(user: User) {
    const jwtPayload = { id: user.id, role: Roles.user };
    return this.authService.generateTokens(jwtPayload);
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const { password, email } = registerUserDto;
    const existedUser = await this.userService.findOneByEmail(email);
    if (existedUser) throw new ConflictException('email already taken');
    const hashPassword = await this.authService.hashPassword(password);

    //save user to db
    const user = await this.userService.create({
      ...registerUserDto,
      password: hashPassword,
    });
    const { accessToken, refreshToken } = this.getTokens(user);
    const sessionId = await this.authService.saveToken(refreshToken, user.id);
    return { accessToken, sessionId, user };
  }

  //set sessionId cookie in response headers
  setCookieHeaders(res: Response, sessionId: string) {
    res.cookie('sid', sessionId, {
      sameSite: 'lax',
      secure: true,
      httpOnly: true,
      expires: sessionId
        ? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        : new Date(0),
    });
  }

  // Helper function to extract the refresh token from the cookie
  getSessionIdFromCookie(cookie: string): string | null {
    const sessionId = cookie
      .split(';')
      .find((c) => c.trim().startsWith('sid='));
    return sessionId ? sessionId.split('=')[1] : null;
  }
}
