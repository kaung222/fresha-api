import { IsNotEmpty } from 'class-validator';

export class UpdateLocation {
  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  latitude: number;

  @IsNotEmpty()
  longitude: number;
}
