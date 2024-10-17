import {
  ArrayMinSize,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class CreateOrganizationDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsPhoneNumber('MM', { each: true })
  @ArrayMinSize(1)
  phones: string[];

  @IsOptional()
  address: string;
}
