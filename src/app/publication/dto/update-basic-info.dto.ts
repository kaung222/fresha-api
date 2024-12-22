import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
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
  @IsUrl()
  thumbnail: string;
}

export class UpdateTypes {
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @IsString({ each: true })
  types: string[];
}
