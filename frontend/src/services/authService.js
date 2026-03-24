import api from './api';

export async function sendOtp(phone) {
  const { data } = await api.post('/auth/send-otp', { phone });
  return data;
}

export async function verifyOtp(phone, otp) {
  const { data } = await api.post('/auth/verify-otp', { phone, otp });
  return data;
}

export async function getCurrentUser() {
  const { data } = await api.get('/auth/me');
  return data;
}

export async function completeProfile(profile) {
  const { data } = await api.post('/auth/profile', profile);
  return data;
}
