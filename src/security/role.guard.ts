import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_KEY } from './role.decorator';
import { Roles } from './user.decorator';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const requiredRoles = this.reflector.getAllAndOverride<Roles[]>(
        ROLE_KEY,
        [context.getHandler(), context.getClass()],
      );
      if (!requiredRoles) {
        return true;
      }
      const request = context.switchToHttp().getRequest();
      const accessToken = request.headers?.authorization?.split(' ')[1];
      const { sub, user } = this.jwtService.verify(accessToken);
      request.org = sub;
      request.user = user;
      // return requiredRoles.some((role) => user.roles?.includes(role));
      return Array.from(requiredRoles).includes(user.role);
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
