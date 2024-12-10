import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { PaymentsService } from '../payments/payments.service';
import { Payment } from '../payments/entities/payment.entity';
import { BullModule } from '@nestjs/bull';
import { BookingItem } from './entities/booking-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, Payment, BookingItem]),
    BullModule.registerQueue({ name: 'notificationQueue' }),
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, PaymentsService],
})
export class AppointmentsModule {}
