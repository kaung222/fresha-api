import { IsNotEmpty } from 'class-validator';

export class UpdateLocation {
  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  latitude: string;

  @IsNotEmpty()
  longitude: string;
}
