import { PaginateQuery } from '@/utils/paginate-query.dto';

export class GetAppointmentDto extends PaginateQuery {
  startDate: string;
  endDate: string;
}
