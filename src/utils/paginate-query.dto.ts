import { Transform } from 'class-transformer';

export class PaginateQuery {
  search?: string;
  @Transform(({ value }) => parseInt(value))
  page?: number;
  @Transform(({ value }) => parseInt(value))
  pageLimit?: number;
}
