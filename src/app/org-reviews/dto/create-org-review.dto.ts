import { IsNotEmpty, IsPositive, IsString, IsUUID } from 'class-validator';

export class CreateOrgReviewDto {
  @IsNotEmpty()
  @IsPositive()
  rating: number;

  @IsNotEmpty()
  @IsString()
  notes: string;

  @IsNotEmpty()
  orgId: number;

  @IsNotEmpty()
  @IsUUID()
  appointmentId: string;
}
