import { IsNotEmpty } from 'class-validator';
import { ClientAppointmentDto } from './create-client-booking.dto';

export class CreateAppointmentDto extends ClientAppointmentDto {
  @IsNotEmpty()
  orgId: number;
}
