import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class SearchServiceDto {
  @IsString()
  @IsOptional()
  search: string;
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page: number;
}
