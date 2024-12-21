import { Appointment } from '@/app/appointments/entities/appointment.entity';
import { CreateEmailBySystem } from '@/app/emails/dto/crearte-email.dto';
import { format } from 'date-fns';

const getDate = (date: Date) => format(new Date(date), 'dd-MM-yyyy');

export function sendBookingNotiToUser(
  appointment: Appointment,
): CreateEmailBySystem {
  return {
    orgId: appointment.orgId,
    subject: 'Booking confirmation',
    text: `Your booking on <b>${getDate(appointment.date)}</b> have been confirmed`,
    to: appointment.email,
    from: appointment.orgEmail,
  };
}

export function sendBookingNotiToMember(
  appointment: Appointment,
): CreateEmailBySystem {
  const emails = [
    ...new Set(appointment.bookingItems.map((item) => item.member.email)),
  ];
  return {
    orgId: appointment.orgId,
    from: appointment.orgEmail,
    subject: 'Booking confirmation',
    text: `You got bookings from ${appointment.username} on ${getDate(appointment.date)}.`,
    to: emails,
  };
}

export function cancelBookingByOrg(
  appointment: Appointment,
  reason: string,
): CreateEmailBySystem {
  return {
    orgId: appointment.orgId,
    from: appointment.orgEmail,
    subject: 'Booking cancellation',
    text: `Your booking on ${getDate(appointment.date)} have been cancelled for the reason ${reason}.`,
    to: appointment.email,
  };
}

export function rescheduleBookingByOrg(
  appointment: Appointment,
  newDate: Date,
  reason: string,
) {
  return {
    orgId: appointment.orgId,
    text: `Your booking is rescheduled from ${getDate(appointment.date)} to ${getDate(newDate)} for the reason ${reason}. 
    Check the due date and You can cancel before 5 hours of your reservation.`,
    subject: 'Booking Reschedule',
    to: appointment.email,
    from: appointment.orgEmail,
  };
}

export function confirmBookingByOrg(appointment: Appointment) {
  return {
    orgId: appointment.orgId,
    to: appointment.email,
    text: `Your booking on <b>${getDate(appointment.date)}</b> have been confirmed by the ${appointment.orgName}.`,
    subject: 'Booking confirmation',
    from: appointment.orgEmail,
  };
}
