import { IsGreaterThanStartDate } from '@/app/closed-days/dto/create-closed-day.dto';
import IsMinCurrentDate from '@/utils/decorators/validators';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateLeaveDto {
  @IsDateString()
  @IsMinCurrentDate()
  startDate: string;

  @IsDateString()
  @IsGreaterThanStartDate()
  endDate: string;

  @IsOptional()
  @IsString()
  notes: string;

  @IsOptional()
  @IsString()
  type: string;

  @IsNotEmpty()
  memberId: string;
}
