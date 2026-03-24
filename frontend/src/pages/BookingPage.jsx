import { useEffect, useMemo, useState } from 'react';
import InlineAlert from '../components/common/InlineAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import {
  createAppointment,
  getDoctorAvailability,
} from '../services/appointmentService';

function BookingPage({ doctor, onBack }) {
  const { user } = useAuth();
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [formData, setFormData] = useState({
    date: today,
    time: '',
    reason: '',
    notes: '',
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function loadAvailability() {
      try {
        setAvailabilityLoading(true);
        setError('');
        const response = await getDoctorAvailability(doctor.id, formData.date);
        setAvailableSlots(response.slots);
        setFormData((current) => ({
          ...current,
          time: response.slots.some((slot) => slot.startTime?.slice(0, 5) === current.time)
            ? current.time
            : response.slots[0]?.startTime?.slice(0, 5) || '',
        }));
      } catch (requestError) {
        setAvailableSlots([]);
        setError(requestError.response?.data?.message || 'Unable to load available appointment slots.');
      } finally {
        setAvailabilityLoading(false);
      }
    }

    loadAvailability();
  }, [doctor.id, formData.date]);

  function handleChange(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function validateForm() {
    if (!formData.time) {
      return 'Please select an available time slot.';
    }

    if (formData.reason.trim().length < 3) {
      return 'Please provide a short reason for the appointment.';
    }

    if (formData.notes.trim().length > 500) {
      return 'Notes must be 500 characters or fewer.';
    }

    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await createAppointment({
        doctorId: doctor.id,
        appointmentDate: formData.date,
        slotTime: formData.time,
        reason: formData.reason.trim(),
        notes: formData.notes.trim(),
      });

      setSuccess(response.message);
      setFormData((current) => ({
        ...current,
        reason: '',
        notes: '',
      }));

      const availabilityResponse = await getDoctorAvailability(doctor.id, formData.date);
      setAvailableSlots(availabilityResponse.slots);
      setFormData((current) => ({
        ...current,
        time: availabilityResponse.slots[0]?.startTime?.slice(0, 5) || '',
      }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to complete booking.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <button type="button" onClick={onBack} className="secondary-button mb-6 px-4 py-2.5 text-sm">
          ← Back to doctors
        </button>

        <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr] xl:gap-8">
          <section className="overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-slate-950 via-slate-900 to-brand-700 p-7 text-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.45)] sm:p-8 lg:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-100">
              Booking summary
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{doctor.name}</h2>
            <p className="mt-2 text-base text-brand-100">{doctor.specialty}</p>
            <p className="mt-6 text-sm leading-7 text-slate-200 sm:text-base">{doctor.description}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                ['Location', doctor.location],
                ['Fee', doctor.fee],
                ['Rating', `⭐ ${doctor.rating}`],
                ['Experience', `${doctor.experience} years`],
              ].map(([label, value]) => (
                <div key={label} className="glass-dark p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-brand-100">{label}</p>
                  <p className="mt-2 text-base font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-card p-6 sm:p-8 lg:p-10">
            <div className="space-y-3">
              <p className="section-kicker">Appointment form</p>
              <h3 className="section-title text-2xl sm:text-3xl">Book your visit</h3>
              <p className="muted-copy">
                Confirm your slot as <span className="font-semibold text-slate-900">{user?.name || user?.phone}</span>.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="soft-card bg-slate-50 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Patient</p>
                <p className="mt-2 font-semibold text-slate-900">{user?.name || 'Profile required'}</p>
              </div>
              <div className="soft-card bg-slate-50 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Phone</p>
                <p className="mt-2 font-semibold text-slate-900">{user?.phone}</p>
              </div>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-slate-700">
                Appointment date
                <input
                  type="date"
                  min={today}
                  value={formData.date}
                  onChange={(event) => handleChange('date', event.target.value)}
                  className="input-control"
                />
              </label>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-slate-700">Available time slots</p>
                  {availabilityLoading ? <LoadingSpinner label="Checking availability..." /> : null}
                </div>

                {!availabilityLoading ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {availableSlots.map((slot) => {
                      const slotTime = slot.startTime?.slice(0, 5);
                      const isSelected = formData.time === slotTime;

                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => handleChange('time', slotTime)}
                          className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition duration-200 ${
                            isSelected
                              ? 'border-brand-700 bg-brand-700 text-white shadow-lg shadow-brand-700/20'
                              : 'border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 hover:shadow-md'
                          }`}
                        >
                          {slotTime}
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                {!availabilityLoading && availableSlots.length === 0 ? (
                  <div className="soft-card border-dashed px-4 py-8 text-center text-sm text-slate-500">
                    No available slots remain for this date. Try another day.
                  </div>
                ) : null}
              </div>

              <label className="block text-sm font-medium text-slate-700">
                Visit reason
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(event) => handleChange('reason', event.target.value)}
                  placeholder="Briefly describe the reason for your visit"
                  className="input-control"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Notes (optional)
                <textarea
                  value={formData.notes}
                  onChange={(event) => handleChange('notes', event.target.value)}
                  placeholder="Add any symptoms, preferences, or extra context"
                  className="input-control min-h-28 resize-y"
                />
              </label>

              <InlineAlert message={error} />
              <InlineAlert tone="success" message={success} />

              <button
                type="submit"
                disabled={loading || availabilityLoading || availableSlots.length === 0}
                className="primary-button w-full"
              >
                {loading ? 'Booking appointment...' : 'Submit booking'}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
