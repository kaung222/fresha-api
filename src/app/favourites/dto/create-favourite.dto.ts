import { IsNotEmpty } from 'class-validator';

export class CreateFavouriteDto {
  @IsNotEmpty()
  orgId: number;
}
