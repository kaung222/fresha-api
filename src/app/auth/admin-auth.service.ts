import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminsService } from '../admins/admins.service';
import { AuthService } from './auth.service';
import { decryptToken } from '@/utils/test';
import { ConfirmOTPDto } from './dto/confirm-otp.dto';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly adminService: AdminsService,
    private authService: AuthService,
  ) {}
  async login(confirmOTPDto: ConfirmOTPDto) {
    const { token, otp } = confirmOTPDto;
    const email = decryptToken(token);
    const admin = await this.adminService.findOneByEmail(email);
    if (!admin) throw new NotFoundException('Admin email not found');
    await this.authService.confirmOTP({ otp, token });
    const { accessToken } = this.authService.generateTokens({
      id: admin.id,
      role: admin.role,
      username: admin.username,
    });
    return { accessToken };
  }

  async getOtp(email: string) {
    const admin = await this.adminService.findOneByEmail(email);
    if (!admin) throw new NotFoundException('Admin email not found');
    return this.authService.getOTP(email);
  }
}
