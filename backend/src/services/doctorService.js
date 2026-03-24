import doctorModel from '../models/doctorModel.js';
import { createAppError } from '../utils/appError.js';

function normalizeDoctorPayload(payload) {
  return {
    name: payload.name?.trim(),
    specialization: payload.specialization?.trim(),
    phone: payload.phone?.trim() || null,
    email: payload.email?.trim() || null,
  };
}

function isValidEmail(value) {
  return !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

class DoctorService {
  async listDoctors() {
    return doctorModel.listAll();
  }

  async getDoctor(id) {
    const doctor = await doctorModel.findById(Number(id));

    if (!doctor) {
      throw createAppError('Doctor not found.', 404);
    }

    return doctor;
  }

  async createDoctor(payload) {
    const normalizedPayload = normalizeDoctorPayload(payload);

    if (!normalizedPayload.name || !normalizedPayload.specialization) {
      throw createAppError('Name and specialization are required.', 400);
    }

    if (!isValidEmail(normalizedPayload.email)) {
      throw createAppError('Doctor email must be valid.', 400);
    }

    return doctorModel.create(normalizedPayload);
  }

  async updateDoctor(id, payload) {
    const existingDoctor = await this.getDoctor(id);
    const normalizedPayload = normalizeDoctorPayload(payload);

    if (!normalizedPayload.name || !normalizedPayload.specialization) {
      throw createAppError('Name and specialization are required.', 400);
    }

    if (!isValidEmail(normalizedPayload.email)) {
      throw createAppError('Doctor email must be valid.', 400);
    }

    return doctorModel.update(existingDoctor.id, normalizedPayload);
  }

  async deleteDoctor(id) {
    const existingDoctor = await this.getDoctor(id);
    await doctorModel.delete(existingDoctor.id);

    return {
      message: 'Doctor deleted successfully.',
    };
  }
}

export default new DoctorService();
