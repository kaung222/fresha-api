import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('User auth')
export class UserAuthController {
  @Post('user-login')
  loginUser() {}

  @Post('user-register')
  registerUser() {}
}
