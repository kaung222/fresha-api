import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class PaginateQuery {
  search?: string;
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  page?: number;
  @Transform(({ value }) => parseInt(value))
  pageLimit?: number;
}
