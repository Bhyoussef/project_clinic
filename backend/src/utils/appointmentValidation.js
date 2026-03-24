import { createAppError } from './appError.js';

export function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isValidTime(value) {
  return /^\d{2}:\d{2}(:\d{2})?$/.test(value);
}

export function normalizeSlotTime(value) {
  if (!isValidTime(value)) {
    return null;
  }

  return value.length === 5 ? `${value}:00` : value;
}

export function isFutureOrToday(dateValue, now = new Date()) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const appointmentDay = new Date(`${dateValue}T00:00:00`);

  return Number.isNaN(appointmentDay.getTime()) === false && appointmentDay >= today;
}

export function validateAppointmentRequest(payload) {
  const { doctorId, appointmentDate, slotTime } = payload;

  if (!doctorId || !appointmentDate || !slotTime) {
    throw createAppError('Doctor, date, and time slot are required.', 400);
  }

  if (!isValidDate(appointmentDate)) {
    throw createAppError('Appointment date must be in YYYY-MM-DD format.', 400);
  }

  if (!isFutureOrToday(appointmentDate)) {
    throw createAppError('Appointment date must be today or later.', 400);
  }

  const normalizedSlotTime = normalizeSlotTime(slotTime);

  if (!normalizedSlotTime) {
    throw createAppError('Time slot must be in HH:MM or HH:MM:SS format.', 400);
  }

  return {
    doctorId: Number(doctorId),
    appointmentDate,
    slotTime: normalizedSlotTime,
  };
}

export function validateAvailabilityDate(slotDate) {
  if (!slotDate) {
    throw createAppError('A slot date is required.', 400);
  }

  if (!isValidDate(slotDate)) {
    throw createAppError('Slot date must be in YYYY-MM-DD format.', 400);
  }

  if (!isFutureOrToday(slotDate)) {
    throw createAppError('Slot date must be today or later.', 400);
  }

  return slotDate;
}
