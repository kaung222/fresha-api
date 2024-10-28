import { IsNotEmpty, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateAppointmentDto } from '@/app/appointments/dto/create-appointment.dto';

export class AddAppointmentDto extends PartialType(CreateAppointmentDto) {
  @IsOptional()
  orgId: number;

  @IsNotEmpty()
  clientId: number;
}
