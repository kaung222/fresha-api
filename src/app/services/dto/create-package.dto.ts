import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { DiscountType, TargetGender } from '../entities/service.entity';

export class CreatePackageDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  categoryId: number;

  @ApiProperty({ default: TargetGender.all, enum: TargetGender })
  @IsEnum(TargetGender)
  targetGender: TargetGender;

  @IsOptional()
  description: string;

  @IsNotEmpty({ each: true })
  @IsArray()
  @ArrayMinSize(2)
  serviceIds: number[];

  @ApiProperty({ example: '[memberId1,memberId2]' })
  @IsArray()
  @IsNotEmpty({ each: true })
  @ArrayMinSize(1)
  memberIds: number[];

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @ValidateIf((o) => o.discountType === DiscountType.percent, {
    message: 'Discount percent must not greater than 100',
  })
  @Max(100)
  discount: number;

  @IsEnum(DiscountType)
  discountType: DiscountType;
}
