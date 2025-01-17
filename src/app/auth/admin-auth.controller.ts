import { Body, Controller, Post } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { ConfirmOTPDto } from './dto/confirm-otp.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Admin Auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}
  @Post('admin-login')
  adminLogin(@Body() ConfirmOTPDto: ConfirmOTPDto) {
    return this.adminAuthService.login(ConfirmOTPDto);
  }

  @Post('request-otp')
  getOtp(@Body('email') email: string) {
    return this.adminAuthService.getOtp(email);
  }
}
