import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export class SignedUser {
  id: string;
  role: Roles;
  status: string;
  type: string;
  orgId: number;
}

export enum Roles {
  user = 'user',
  org = 'organization',
  member = 'member',
  admin = 'admin',
  sysadmin = 'sysadmin',
}

export const User = createParamDecorator(
  (data: 'id' | 'role' | 'orgId', ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: SignedUser = request.user;
    return data ? user?.[data] : user;
  },
);

export const Org = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const org = request.org;
    return org;
  },
);
