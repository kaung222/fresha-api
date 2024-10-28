import { IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateOrgReviewDto {
  @IsNotEmpty()
  @IsPositive()
  rating: number;

  @IsNotEmpty()
  @IsString()
  notes: string;

  @IsNotEmpty()
  orgId: number;
}
