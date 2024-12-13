import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  DiscountType,
  PriceType,
  TargetGender,
} from '../entities/service.entity';

export class CreateServiceDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  categoryId: number;

  @IsNotEmpty()
  @Min(0)
  @Max(1000000)
  price: number;

  @IsOptional()
  thumbnailUrl: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  duration: number;

  @ApiProperty({ default: TargetGender.all, enum: TargetGender })
  @IsEnum(TargetGender)
  targetGender: TargetGender;

  @IsOptional()
  description: string;

  @ApiProperty({ example: '[memberId1,memberId2]' })
  @IsNotEmpty()
  @ArrayMinSize(1)
  memberIds: number[];

  @IsNotEmpty()
  @IsEnum(PriceType)
  priceType: PriceType;

  @IsNotEmpty()
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @ValidateIf((o) => o.discountType === DiscountType.percent, {
    message: 'Discount percent must not greater than 100',
  })
  @ValidateIf(
    (obj, val) => {
      if (obj.discountType === DiscountType.fixed) return val > obj.price;
    },
    {
      message: 'Discount should not greater than the price',
    },
  )
  @Max(100)
  discount: number;

  @IsEnum(DiscountType)
  discountType: DiscountType;
}
