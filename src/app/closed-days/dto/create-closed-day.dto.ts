import { MinDateString } from '@/utils/decorators/validators';
import { Transform, Type } from 'class-transformer';
import {
  IsDate,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinDate,
  Validate,
} from 'class-validator';

export class CreateClosedDayDto {
  //   @IsDateString()
  //   @IsNotEmpty()
  //   @Type(() => Date)
  //   @MinDate(() => new Date('2024-11-11'))
  //   startDate: string;

  @IsDateString()
  @Validate(MinDateString)
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsOptional()
  @IsString()
  notes: string;

  @IsOptional()
  @IsString()
  type: string;
}
