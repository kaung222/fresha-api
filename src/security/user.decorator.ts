import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export class SignedUserDto {
  id: string;
  role: string;
  status: string;
  type: string;
}
export enum Roles {
  user = 'user',
  org = 'organisation',
}

export const SignedUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
