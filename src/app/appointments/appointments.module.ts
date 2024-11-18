import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { PaymentsService } from '../payments/payments.service';
import { Payment } from '../payments/entities/payment.entity';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Payment]),
    BullModule.registerQueue({ name: 'emailQueue' }),
    BullModule.registerQueue({ name: 'notificationQueue' }),
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, PaymentsService],
})
export class AppointmentsModule {}
