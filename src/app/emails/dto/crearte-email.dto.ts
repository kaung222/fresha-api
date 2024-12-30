import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateEmailBySystem {
  to?: string | string[];
  text: string;
  subject: string;
  from: string;
  orgId?: number;
}
