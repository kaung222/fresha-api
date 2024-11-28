import { Appointment } from '../appointments/entities/appointment.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { User } from '../users/entities/user.entity';

export function createAppointmentByUser(orgId: number, user: User) {
  return {
    body: `You received an appointment from ${user.firstName} ${user.lastName}`,
    userId: orgId,
    title: 'New appointment received',
    type: 'Appointment',
    link: '/appointments',
    thumbnail: user.profilePicture,
  };
}

export function confirmBookingByOrg(org: Organization, userId: number) {
  return {
    body: `Your appointment have been approved by ${org.name}`,
    userId,
    title: 'Appointment approved',
    type: 'Appointment',
    link: '/appointments',
    thumbnail: org.images[0],
  };
}

export function cancelBookingByOrg(appointment: Appointment, reason: string) {
  const { user, organization } = appointment;
  return {
    body: `Your appointment have been cancel by ${organization.name} for the reason:  ${reason}`,
    userId: user.id,
    title: 'Appointment cancelled',
    type: 'Appointment',
    link: '/appointments',
    thumbnail: organization.images[0],
  };
}
