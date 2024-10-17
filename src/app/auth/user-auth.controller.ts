import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('user')
@ApiTags('User auth')
export class UserAuthController {
  @Post()
  loginUser() {}

  @Post()
  registerUser() {}
}
