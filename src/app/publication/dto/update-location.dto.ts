import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateLocation {
  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  latitude: number;

  @IsNotEmpty()
  longitude: number;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  country: string;
}
