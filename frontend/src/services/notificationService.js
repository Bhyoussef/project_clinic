import api from './api';

export async function getDoctorNotifications(doctorId) {
  const { data } = await api.get(`/notifications/doctor/${doctorId}`);
  return data;
}
