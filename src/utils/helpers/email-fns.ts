import { Appointment } from '@/app/appointments/entities/appointment.entity';
import { CreateEmailDto } from '@/app/emails/dto/crearte-email.dto';
import { format } from 'date-fns';

const getDate = (date: Date) => format(new Date(date), 'dd-MM-yyyy');

export function sendBookingNotiToUser(
  appointment: Appointment,
): CreateEmailDto {
  return {
    recipientName: appointment.username,
    subject: 'Booking confirmation',
    text: `Your booking on ${getDate(appointment.date)} have been confirmed`,
    to: appointment.email,
  };
}

export function sendBookingNotiToMember(
  appointment: Appointment,
  emails: string[],
): CreateEmailDto {
  return {
    recipientName: appointment.username,
    subject: 'Booking confirmation',
    text: `You got an booking from ${appointment.username} on ${getDate(appointment.date)}.`,
    to: emails,
  };
}

export function cancelBookingByOrg(
  appointment: Appointment,
  reason: string,
): CreateEmailDto {
  return {
    recipientName: appointment.username,
    subject: 'Booking cancellation',
    text: `Your booking on ${getDate(appointment.date)} have been cancelled for the reason ${reason}.`,
    to: appointment.email,
  };
}
