import { User } from '@/app/users/entities/user.entity';

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

export function createAppointmentByOrg(orgId: number, user: User) {
  return {
    body: `You received an appointment from ${user.firstName} ${user.lastName}`,
    userId: orgId,
    title: 'New appointment received',
    type: 'Appointment',
    link: '/appointments',
    thumbnail: user.profilePicture,
  };
}
