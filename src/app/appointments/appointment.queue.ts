import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor()
export class AppointmentQueue {
  constructor() {}
  @Process('appointment.created')
  appointmentCreate({ data }: Job<{ memberId: number }>) {
    console.log(data.memberId);
  }
}
