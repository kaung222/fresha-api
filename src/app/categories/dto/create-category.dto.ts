import { IsNotEmpty, IsOptional, IsString, Max } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  @Max(255)
  notes: string;
}
