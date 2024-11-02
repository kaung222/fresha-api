import { PaginateQuery } from '@/utils/paginate-query.dto';

export class GetAppointmentDto extends PaginateQuery {
  date: string;
  username: string;
}
