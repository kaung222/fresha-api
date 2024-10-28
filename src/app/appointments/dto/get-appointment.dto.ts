import { PaginateQuery } from '@/utils/paginate-query.dto';

export class GetAppointmentDto extends PaginateQuery {
  date: Date;
  username: string;
}
