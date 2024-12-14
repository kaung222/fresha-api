import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateEmailByOrg {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  recipientName: string;

  @IsNotEmpty()
  @IsBoolean()
  isToAllClient: boolean;

  @ValidateIf((obj) => !obj.isToAllClient)
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  to: string[];
}
