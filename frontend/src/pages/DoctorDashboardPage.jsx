import { useEffect, useMemo, useState } from 'react';
import InlineAlert from '../components/common/InlineAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useDoctors } from '../hooks/useDoctors';
import { getDoctorNotifications } from '../services/notificationService';
import {
  getDoctorAppointments,
  updateAppointmentStatus,
} from '../services/appointmentService';

function StatusBadge({ status }) {
  const styles = {
    scheduled: 'status-badge bg-amber-50 text-amber-700 border-amber-200',
    confirmed: 'status-badge bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'status-badge bg-rose-50 text-rose-700 border-rose-200',
  };

  return <span className={styles[status] || styles.scheduled}>{status}</span>;
}

function formatTimestamp(value) {
  if (!value) {
    return 'Just now';
  }

  return new Date(value).toLocaleString();
}

function DoctorDashboardPage({ onBackHome }) {
  const { doctors, loading: doctorsLoading, error: doctorsError, reloadDoctors } = useDoctors();
  const [activeDoctorId, setActiveDoctorId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const activeDoctor = useMemo(
    () => doctors.find((doctor) => doctor.id === activeDoctorId) || doctors[0] || null,
    [activeDoctorId, doctors]
  );

  useEffect(() => {
    if (!activeDoctorId && doctors[0]?.id) {
      setActiveDoctorId(doctors[0].id);
    }
  }, [activeDoctorId, doctors]);

  useEffect(() => {
    async function loadDashboardData() {
      if (!activeDoctor?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const [appointmentsResponse, notificationsResponse] = await Promise.all([
          getDoctorAppointments(activeDoctor.id),
          getDoctorNotifications(activeDoctor.id),
        ]);
        setAppointments(appointmentsResponse.appointments);
        setNotifications(notificationsResponse.notifications);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [activeDoctor?.id]);

  async function handleStatusUpdate(appointmentId, status) {
    try {
      setActionLoadingId(appointmentId);
      setNotice('');
      setError('');
      const response = await updateAppointmentStatus(appointmentId, status);
      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === appointmentId ? response.appointment : appointment
        )
      );

      const notificationsResponse = await getDoctorNotifications(activeDoctor.id);
      setNotifications(notificationsResponse.notifications);
      setNotice(response.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update appointment status.');
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="page-shell bg-slate-100/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:px-8 lg:py-10">
        <aside className="soft-card w-full bg-slate-950 p-6 text-white lg:sticky lg:top-28 lg:w-80 lg:shrink-0 lg:self-start">
          <button type="button" onClick={onBackHome} className="secondary-button mb-8 border-white/10 bg-white/5 px-4 py-2.5 text-slate-100 hover:border-white/30 hover:bg-white/10 hover:text-white">
            ← Back to patient view
          </button>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-200">
              Doctor Dashboard
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Appointments</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Review scheduled patients and confirm or reject appointment requests.
            </p>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <button type="button" onClick={reloadDoctors} className="secondary-button w-full border-white/10 bg-white/5 text-slate-100 hover:border-white/30 hover:bg-white/10 hover:text-white">
              Refresh doctors
            </button>
          </div>

          <div className="mt-8 space-y-3">
            {doctors.map((doctor) => {
              const isActive = activeDoctor?.id === doctor.id;

              return (
                <button
                  key={doctor.id}
                  type="button"
                  onClick={() => setActiveDoctorId(doctor.id)}
                  className={`sidebar-button ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xl shadow-slate-950/20'
                      : 'bg-white/5 text-slate-200 hover:bg-white/10'
                  }`}
                >
                  <p className="font-semibold">{doctor.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-inherit/80">
                    {doctor.specialty}
                  </p>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          <InlineAlert message={doctorsError} />
          <InlineAlert tone="success" message={notice} />
          <InlineAlert message={error} />

          <div className="surface-card p-6 sm:p-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="section-kicker">Active doctor</p>
                <h1 className="section-title text-3xl">{activeDoctor?.name || 'No doctor selected'}</h1>
                <p className="muted-copy mt-1">{activeDoctor?.specialty || 'Select a doctor to load the dashboard.'}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="soft-card px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Appointments loaded</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{appointments.length}</p>
                </div>
                <div className="soft-card px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Notifications</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{notifications.length}</p>
                </div>
              </div>
            </div>
          </div>

          {doctorsLoading || loading ? <LoadingSpinner label="Loading doctor workspace..." center /> : null}

          {!doctorsLoading && !loading && !activeDoctor ? (
            <div className="soft-card px-6 py-12 text-center text-sm text-slate-500">
              No doctors are available yet.
            </div>
          ) : null}

          {!loading && activeDoctor ? (
            <>
              <section className="surface-card p-6 sm:p-8">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900">Notifications</h3>
                  <p className="muted-copy mt-1">
                    Appointment updates stored in the database for this doctor.
                  </p>
                </div>

                <div className="mt-6 space-y-3.5">
                  {notifications.length === 0 ? (
                    <div className="soft-card border-dashed px-4 py-10 text-center text-sm text-slate-500">
                      No notifications yet for this doctor.
                    </div>
                  ) : null}

                  {notifications.map((notification) => (
                    <div key={notification.id} className="soft-card bg-slate-50 px-5 py-4 transition duration-200 hover:border-brand-100 hover:bg-white hover:shadow-md">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{notification.title}</p>
                          <p className="mt-1.5 text-sm leading-6 text-slate-600">{notification.message}</p>
                          {notification.patientName ? (
                            <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-brand-700">
                              Patient: {notification.patientName}
                            </p>
                          ) : null}
                        </div>
                        <span className="text-xs text-slate-400">{formatTimestamp(notification.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="surface-card overflow-hidden">
                <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900">Appointment requests</h3>
                  <p className="muted-copy mt-1">Manage bookings and update each patient request.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="table-head-cell">Patient</th>
                        <th className="table-head-cell">Date</th>
                        <th className="table-head-cell">Time</th>
                        <th className="table-head-cell">Status</th>
                        <th className="table-head-cell">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {appointments.map((appointment) => (
                        <tr key={appointment.id} className="table-row">
                          <td className="px-6 py-4 align-top sm:px-8">
                            <p className="font-semibold text-slate-900">{appointment.patientName || 'Patient'}</p>
                            <p className="mt-1 text-sm text-slate-500">{appointment.patientPhone}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 sm:px-8">{appointment.appointmentDate?.slice(0, 10)}</td>
                          <td className="px-6 py-4 text-sm text-slate-600 sm:px-8">
                            {appointment.slotStartTime?.slice(0, 5) || appointment.appointmentDate?.slice(11, 16)}
                          </td>
                          <td className="px-6 py-4 sm:px-8">
                            <StatusBadge status={appointment.status} />
                          </td>
                          <td className="px-6 py-4 sm:px-8">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                                disabled={appointment.status === 'confirmed' || actionLoadingId === appointment.id}
                                className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {actionLoadingId === appointment.id ? 'Saving...' : 'Confirm'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusUpdate(appointment.id, 'rejected')}
                                disabled={appointment.status === 'rejected' || actionLoadingId === appointment.id}
                                className="inline-flex items-center rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {actionLoadingId === appointment.id ? 'Saving...' : 'Reject'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {appointments.length === 0 ? (
                    <div className="px-6 py-16 text-center sm:px-8">
                      <p className="text-lg font-semibold text-slate-900">No appointments yet.</p>
                      <p className="mt-2 text-sm text-slate-500">
                        New bookings will appear here for the selected doctor.
                      </p>
                    </div>
                  ) : null}
                </div>
              </section>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default DoctorDashboardPage;
