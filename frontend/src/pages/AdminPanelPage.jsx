import { useEffect, useMemo, useState } from 'react';
import InlineAlert from '../components/common/InlineAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getAllAppointments } from '../services/appointmentService';
import {
  createDoctor,
  deleteDoctor,
  getDoctors,
  updateDoctor,
} from '../services/doctorService';

function AppointmentStatusBadge({ status }) {
  const styles = {
    scheduled: 'status-badge bg-amber-50 border-amber-200 text-amber-700',
    confirmed: 'status-badge bg-emerald-50 border-emerald-200 text-emerald-700',
    rejected: 'status-badge bg-rose-50 border-rose-200 text-rose-700',
  };

  return <span className={styles[status] || styles.scheduled}>{status}</span>;
}

const initialDoctorForm = {
  name: '',
  specialization: '',
  phone: '',
  email: '',
};

function AdminPanelPage({ onBackHome }) {
  const [activeSection, setActiveSection] = useState('doctors');
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingDoctor, setSavingDoctor] = useState(false);
  const [deletingDoctorId, setDeletingDoctorId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [doctorForm, setDoctorForm] = useState(initialDoctorForm);

  const sectionTitle = useMemo(
    () => (activeSection === 'doctors' ? 'Manage Doctors' : 'Manage Appointments'),
    [activeSection]
  );

  async function loadDoctors() {
    const response = await getDoctors();
    setDoctors(response.doctors);
  }

  async function loadAppointments() {
    const response = await getAllAppointments();
    setAppointments(response.appointments);
  }

  async function loadAdminData() {
    try {
      setLoading(true);
      setError('');
      await Promise.all([loadDoctors(), loadAppointments()]);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load admin data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  function resetDoctorForm() {
    setDoctorForm(initialDoctorForm);
    setEditingDoctorId(null);
  }

  async function handleDoctorSubmit(event) {
    event.preventDefault();
    setError('');
    setNotice('');
    setSavingDoctor(true);

    try {
      if (editingDoctorId) {
        await updateDoctor(editingDoctorId, doctorForm);
        setNotice('Doctor updated successfully.');
      } else {
        await createDoctor(doctorForm);
        setNotice('Doctor created successfully.');
      }

      await loadDoctors();
      resetDoctorForm();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save doctor.');
    } finally {
      setSavingDoctor(false);
    }
  }

  async function handleDeleteDoctor(id) {
    try {
      setDeletingDoctorId(id);
      setError('');
      setNotice('');
      await deleteDoctor(id);
      setNotice('Doctor deleted successfully.');
      await Promise.all([loadDoctors(), loadAppointments()]);
      if (editingDoctorId === id) {
        resetDoctorForm();
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete doctor.');
    } finally {
      setDeletingDoctorId(null);
    }
  }

  function handleEditDoctor(doctor) {
    setEditingDoctorId(doctor.id);
    setDoctorForm({
      name: doctor.name || '',
      specialization: doctor.specialization || '',
      phone: doctor.phone || '',
      email: doctor.email || '',
    });
    setActiveSection('doctors');
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
              Admin Panel
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">Clinic management</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Manage doctors and review all appointments from one refined dashboard.
            </p>
          </div>

          <div className="mt-8 space-y-3">
            {[
              { key: 'doctors', label: 'Manage Doctors' },
              { key: 'appointments', label: 'Manage Appointments' },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveSection(item.key)}
                className={`sidebar-button ${
                  activeSection === item.key
                    ? 'bg-white text-slate-900 shadow-xl shadow-slate-950/20'
                    : 'bg-white/5 text-slate-200 hover:bg-white/10'
                }`}
              >
                <p className="font-semibold">{item.label}</p>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          <section className="surface-card p-6 sm:p-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="section-kicker">Admin overview</p>
                <h1 className="section-title text-3xl">{sectionTitle}</h1>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="soft-card px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Doctors</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{doctors.length}</p>
                </div>
                <div className="soft-card px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Appointments</p>
                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{appointments.length}</p>
                </div>
              </div>
            </div>
          </section>

          <InlineAlert tone="success" message={notice} />
          <InlineAlert message={error} />

          {loading ? <LoadingSpinner label="Loading admin workspace..." center /> : null}

          {!loading && activeSection === 'doctors' ? (
            <div className="grid gap-6 2xl:grid-cols-[0.9fr_1.1fr]">
              <section className="surface-card p-6 sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                      {editingDoctorId ? 'Edit doctor' : 'Add doctor'}
                    </h3>
                    <p className="muted-copy mt-1">
                      Create or update doctor records for the clinic.
                    </p>
                  </div>

                  {editingDoctorId ? (
                    <button type="button" onClick={resetDoctorForm} className="secondary-button px-4 py-2.5 text-sm">
                      Cancel edit
                    </button>
                  ) : null}
                </div>

                <form className="mt-6 space-y-4" onSubmit={handleDoctorSubmit}>
                  {[
                    ['name', 'Doctor name'],
                    ['specialization', 'Specialization'],
                    ['phone', 'Phone number'],
                    ['email', 'Email address'],
                  ].map(([field, label]) => (
                    <label key={field} className="block text-sm font-medium text-slate-700">
                      {label}
                      <input
                        type={field === 'email' ? 'email' : 'text'}
                        value={doctorForm[field]}
                        onChange={(event) =>
                          setDoctorForm((current) => ({
                            ...current,
                            [field]: event.target.value,
                          }))
                        }
                        className="input-control"
                      />
                    </label>
                  ))}

                  <button type="submit" disabled={savingDoctor} className="primary-button w-full">
                    {savingDoctor
                      ? editingDoctorId
                        ? 'Updating doctor...'
                        : 'Creating doctor...'
                      : editingDoctorId
                        ? 'Update Doctor'
                        : 'Create Doctor'}
                  </button>
                </form>
              </section>

              <section className="surface-card overflow-hidden">
                <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900">Doctor records</h3>
                  <p className="muted-copy mt-1">Simple CRUD management for clinic doctors.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="table-head-cell">Name</th>
                        <th className="table-head-cell">Specialty</th>
                        <th className="table-head-cell">Contact</th>
                        <th className="table-head-cell">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {doctors.map((doctor) => (
                        <tr key={doctor.id} className="table-row">
                          <td className="px-6 py-4 sm:px-8">
                            <p className="font-semibold text-slate-900">{doctor.name}</p>
                            <p className="mt-1 text-sm text-slate-500">{doctor.email || 'No email'}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 sm:px-8">{doctor.specialization}</td>
                          <td className="px-6 py-4 text-sm text-slate-600 sm:px-8">{doctor.phone || 'No phone'}</td>
                          <td className="px-6 py-4 sm:px-8">
                            <div className="flex flex-wrap gap-2">
                              <button type="button" onClick={() => handleEditDoctor(doctor)} className="secondary-button px-4 py-2 text-xs">
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteDoctor(doctor.id)}
                                disabled={deletingDoctorId === doctor.id}
                                className="inline-flex items-center rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deletingDoctorId === doctor.id ? 'Deleting...' : 'Delete'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {doctors.length === 0 ? (
                    <div className="px-6 py-16 text-center text-sm text-slate-500 sm:px-8">No doctors found.</div>
                  ) : null}
                </div>
              </section>
            </div>
          ) : null}

          {!loading && activeSection === 'appointments' ? (
            <section className="surface-card overflow-hidden">
              <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
                <h3 className="text-2xl font-bold tracking-tight text-slate-900">All appointments</h3>
                <p className="muted-copy mt-1">Review all booked appointments across the clinic.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="table-head-cell">Patient</th>
                      <th className="table-head-cell">Doctor</th>
                      <th className="table-head-cell">Date</th>
                      <th className="table-head-cell">Time</th>
                      <th className="table-head-cell">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {appointments.map((appointment) => (
                      <tr key={appointment.id} className="table-row">
                        <td className="px-6 py-4 sm:px-8">
                          <p className="font-semibold text-slate-900">{appointment.patientName || 'Patient'}</p>
                          <p className="mt-1 text-sm text-slate-500">{appointment.patientPhone}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 sm:px-8">{appointment.doctorName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 sm:px-8">{appointment.appointmentDate?.slice(0, 10)}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 sm:px-8">{appointment.slotStartTime?.slice(0, 5)}</td>
                        <td className="px-6 py-4 sm:px-8">
                          <AppointmentStatusBadge status={appointment.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {appointments.length === 0 ? (
                  <div className="px-6 py-16 text-center text-sm text-slate-500 sm:px-8">No appointments found.</div>
                ) : null}
              </div>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default AdminPanelPage;
