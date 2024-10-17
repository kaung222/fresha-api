import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegisterOrgDto } from './dto/register-org.dto';
import { loginOrganizationDto } from './dto/login-org.dto';

@Controller('auth/organizaton')
@ApiTags('Organization Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiOperation({ summary: 'Login organisation as root user' })
  login(@Body() loginOrgDto: loginOrganizationDto) {
    return this.authService.loginOrganization(loginOrgDto);
  }

  @Post()
  @ApiOperation({ summary: 'register organisation as root user' })
  register(@Body() registerOrgDto: RegisterOrgDto) {
    return this.authService.registerOrganization(registerOrgDto);
  }
}
