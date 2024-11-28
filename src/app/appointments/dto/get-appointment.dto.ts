import { PaginateQuery } from '@/utils/paginate-query.dto';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class GetAppointmentDto extends PaginateQuery {
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}
