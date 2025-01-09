import { IsOptional } from 'class-validator';

export class OrgSearchDto {
  search: string;

  types?: string[];
  lat?: number;
  @IsOptional()
  long?: number;
}
