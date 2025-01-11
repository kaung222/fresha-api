import { IsNotEmpty, IsUUID } from 'class-validator';

export class SubscribeDto {
  @IsNotEmpty()
  pricingId: number;
}
