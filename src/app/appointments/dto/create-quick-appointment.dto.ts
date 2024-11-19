import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
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

  @IsOptional()
  @ValidateIf((obj) => !obj.serviceIds || obj.serviceIds.length === 0)
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsInt({ each: true })
  packageIds: number[];
}
