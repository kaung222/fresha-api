import { SetMetadata } from '@nestjs/common';
import { Roles } from './user.decorator';

export const ROLE_KEY = 'role';
export const Role = (...roles: Roles[]) => SetMetadata(ROLE_KEY, roles);
