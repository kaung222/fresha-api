import { Body, Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Member Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
}
