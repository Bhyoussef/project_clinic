import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isFutureOrToday,
  normalizeSlotTime,
  validateAppointmentRequest,
  validateAvailabilityDate,
} from '../src/utils/appointmentValidation.js';

test('normalizeSlotTime normalizes HH:MM values to HH:MM:SS', () => {
  assert.equal(normalizeSlotTime('09:30'), '09:30:00');
  assert.equal(normalizeSlotTime('14:00:00'), '14:00:00');
  assert.equal(normalizeSlotTime('bad-input'), null);
});

test('isFutureOrToday rejects past dates and accepts the same day or later', () => {
  const now = new Date('2026-03-23T10:00:00Z');
  assert.equal(isFutureOrToday('2026-03-22', now), false);
  assert.equal(isFutureOrToday('2026-03-23', now), true);
  assert.equal(isFutureOrToday('2026-03-24', now), true);
});

test('validateAppointmentRequest returns normalized booking input', () => {
  const result = validateAppointmentRequest({
    doctorId: '5',
    appointmentDate: '2099-04-02',
    slotTime: '10:30',
  });

  assert.deepEqual(result, {
    doctorId: 5,
    appointmentDate: '2099-04-02',
    slotTime: '10:30:00',
  });
});

test('validateAppointmentRequest rejects malformed payloads', () => {
  assert.throws(
    () =>
      validateAppointmentRequest({
        doctorId: 1,
        appointmentDate: '2026/03/23',
        slotTime: '09:00',
      }),
    /YYYY-MM-DD/
  );

  assert.throws(
    () =>
      validateAppointmentRequest({
        doctorId: 1,
        appointmentDate: '2000-03-23',
        slotTime: '09:00',
      }),
    /today or later/
  );

  assert.throws(
    () =>
      validateAppointmentRequest({
        doctorId: 1,
        appointmentDate: '2099-03-23',
        slotTime: '9am',
      }),
    /HH:MM/
  );
});

test('validateAvailabilityDate rejects missing, past, and malformed dates', () => {
  assert.throws(() => validateAvailabilityDate(''), /required/);
  assert.throws(() => validateAvailabilityDate('03-23-2026'), /YYYY-MM-DD/);
  assert.throws(() => validateAvailabilityDate('2000-01-01'), /today or later/);
  assert.equal(validateAvailabilityDate('2099-01-01'), '2099-01-01');
});
