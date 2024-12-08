import { Appointment } from '@/app/appointments/entities/appointment.entity';
import { SendEmailDto } from '@/global/email.service';
import { format } from 'date-fns';

const getDate = (date: string) => format(new Date(date), 'dd-MM-yyyy');

export function sendBookingNotiToUser(appointment: Appointment): SendEmailDto {
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
): SendEmailDto {
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
): SendEmailDto {
  return {
    recipientName: appointment.username,
    subject: 'Booking cancellation',
    text: `Your booking on ${getDate(appointment.date)} have been cancelled for the reason ${reason}.`,
    to: appointment.email,
  };
}
