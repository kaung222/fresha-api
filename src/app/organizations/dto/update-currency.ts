import { Currency } from '@/app/features/entities/feature.entity';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateCurrency {
  @IsNotEmpty()
  @IsEnum(Currency)
  currency: Currency;
}
