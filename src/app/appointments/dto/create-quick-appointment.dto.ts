import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateQuickAppointment {
  @IsOptional()
  clientId: number;

  @IsString()
  @IsOptional()
  username: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  serviceIds: number[];

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  startTime: number;
}
