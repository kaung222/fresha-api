import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthService } from './auth.service';
import { Roles } from '@/security/user.decorator';
import { RegisterUserDto } from './dto/register-user.dto';
import { Response } from 'express';

@Injectable()
export class UserAuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private authService: AuthService,
  ) {}
  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'password', 'firstName'],
    });
    if (!user) throw new NotFoundException('User not found');
    const isAuthenticated = await this.authService.checkPassword(
      password,
      user.password,
    );
    if (!isAuthenticated)
      throw new UnauthorizedException('Invalid email or password');
    const jwtPayload = { user: { id: user.id, role: Roles.user } };
    const tokens = this.authService.generateTokens(jwtPayload);
    return {
      message: 'Login successfully',
      user,
      ...tokens,
    };
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    const { email } = registerUserDto;
    const user = await this.userRepository.findOneBy({ email });
    if (user) throw new ConflictException('email already taken');
    const password = this.authService.hashPassword(registerUserDto.password);
    const createUser = this.userRepository.create({
      password,
      ...registerUserDto,
    });
    const newUser = await this.userRepository.save(createUser);
    const jwtPayload = { user: { id: newUser.id, role: Roles.user } };
    const tokens = this.authService.generateTokens(jwtPayload);
    return {
      ...newUser,
      ...tokens,
      message: 'Register successfully',
    };
  }

  //set refresh token cookie in response headers
  setCookieHeaders(res: Response, refreshToken: string) {
    return this.authService.setCookieHeaders(res, refreshToken);
  }
  // Helper function to extract the refresh token from the cookie
  getRefreshTokenFromCookie(cookie: string): string | null {
    return this.authService.getRefreshTokenFromCookie(cookie);
  }
}
