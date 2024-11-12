import {
  ArrayMinSize,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateBasiceInfo {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @ArrayMinSize(1)
  phones: string[];

  @IsOptional()
  @IsString()
  notes: string;

  @IsNotEmpty()
  types: string[];
}
