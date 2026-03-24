import api from './api';

export async function getAllAppointments() {
  const { data } = await api.get('/appointments');
  return data;
}

export async function getDoctorAppointments(doctorId) {
  const { data } = await api.get(`/appointments/doctor/${doctorId}`);
  return data;
}

export async function getDoctorAvailability(doctorId, date) {
  const { data } = await api.get(`/appointments/doctor/${doctorId}/availability`, {
    params: { date },
  });
  return data;
}

export async function createAppointment(payload) {
  const { data } = await api.post('/appointments', payload);
  return data;
}

export async function updateAppointmentStatus(id, status) {
  const { data } = await api.put(`/appointments/${id}`, { status });
  return data;
}
