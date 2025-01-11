import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsPositive,
  IsInt,
} from 'class-validator';

export class CreatePricingDto {
  @IsString()
  title: string; // The name of the subscription plan

  @IsString()
  description: string; // A brief description of the plan

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number; // The cost of the subscription plan

  @IsString()
  currency: string; // The currency of the price (e.g., USD)

  @IsBoolean()
  @IsOptional()
  isPopular?: boolean; // Whether the plan is highlighted as "popular"

  @IsArray()
  @IsOptional()
  features?: string[]; // A list of features included in the plan

  @IsBoolean()
  @IsOptional()
  isActive?: boolean; // Whether the plan is currently active

  @IsInt()
  @IsOptional()
  trialPeriod?: number; // The trial period in days (optional)
}
