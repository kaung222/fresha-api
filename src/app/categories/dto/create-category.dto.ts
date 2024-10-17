import { IsNotEmpty, IsOptional, IsString, Max } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  creatorId: string;

  @IsString()
  @IsOptional()
  @Max(255)
  notes: string;
}
