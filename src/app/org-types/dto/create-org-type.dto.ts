import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateOrgTypeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  @IsUrl()
  icon: string;
}
