import { Transform } from 'class-transformer';

export class PaginateQuery {
  search?: string;
  @Transform(({ value }) => (value ? parseInt(value) : 1))
  page?: number;
  @Transform(({ value }) => parseInt(value))
  pageLimit?: number;
}
