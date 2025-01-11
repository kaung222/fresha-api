import { PartialType } from '@nestjs/swagger';
import { CreatePricingDto } from './create-pricing.dto';

export class UpdatePricingDto extends PartialType(CreatePricingDto) {}
