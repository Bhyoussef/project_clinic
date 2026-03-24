import api from './api';

export async function getDoctors() {
  const { data } = await api.get('/doctors');
  return data;
}

export async function createDoctor(payload) {
  const { data } = await api.post('/doctors', payload);
  return data;
}

export async function updateDoctor(id, payload) {
  const { data } = await api.put(`/doctors/${id}`, payload);
  return data;
}

export async function deleteDoctor(id) {
  const { data } = await api.delete(`/doctors/${id}`);
  return data;
}
