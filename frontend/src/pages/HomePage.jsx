import { useMemo, useState } from 'react';
import DoctorCard from '../components/DoctorCard';
import InlineAlert from '../components/common/InlineAlert';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { useDoctors } from '../hooks/useDoctors';

function HomePage({
  onBookDoctor,
  onOpenDashboard,
  onOpenAdmin,
  onOpenLogin,
  onLogout,
}) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const { doctors, loading, error, reloadDoctors } = useDoctors();

  const filteredDoctors = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return doctors;
    }

    return doctors.filter((doctor) => {
      const searchableText = [doctor.name, doctor.specialty, doctor.location, doctor.description]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [doctors, searchTerm]);

  return (
    <div className="page-shell">
      <Navbar
        onOpenDashboard={onOpenDashboard}
        onOpenAdmin={onOpenAdmin}
        onOpenLogin={onOpenLogin}
        onLogout={onLogout}
        user={user}
      />

      <section className="page-container space-y-12 pb-16 pt-8 sm:space-y-14 sm:pt-10">
        <div className="overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-slate-950 via-slate-900 to-brand-700 px-6 py-10 text-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.45)] sm:px-8 sm:py-12 lg:px-12 lg:py-14">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-7">
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
                Production-ready clinic booking portal
              </span>

              <div className="space-y-4">
                <h2 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl xl:text-6xl">
                  Book trusted doctors with secure OTP sign-in.
                </h2>
                <p className="max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
                  Search by specialty, location, or doctor name and access authenticated booking,
                  doctor workflows, and admin operations from one stable interface.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="glass-dark p-5">
                  <p className="text-3xl font-bold tracking-tight">6</p>
                  <p className="mt-1 text-sm text-slate-200">Seeded doctors ready</p>
                </div>
                <div className="glass-dark p-5">
                  <p className="text-3xl font-bold tracking-tight">OTP</p>
                  <p className="mt-1 text-sm text-slate-200">Protected workflows</p>
                </div>
                <div className="glass-dark p-5">
                  <p className="text-3xl font-bold tracking-tight">Live API</p>
                  <p className="mt-1 text-sm text-slate-200">Backed by Express + MySQL</p>
                </div>
              </div>
            </div>

            <div className="surface-card p-6 text-slate-900 sm:p-8">
              <p className="section-kicker">Search doctors</p>
              <h3 className="section-title text-2xl sm:text-3xl">Find care that fits your needs</h3>
              <p className="muted-copy mt-2">
                Browse the live doctor directory by name, specialty, or clinic location.
              </p>

              <div className="mt-8 space-y-3">
                <label className="text-sm font-medium text-slate-700" htmlFor="doctor-search">
                  Search
                </label>
                <input
                  id="doctor-search"
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search cardiology, pediatrics, downtown..."
                  className="input-control"
                />
              </div>

              <div id="specialties" className="mt-8 flex flex-wrap gap-2.5">
                {['Cardiology', 'Dermatology', 'Pediatrics', 'Orthopedics', 'Neurology'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSearchTerm(item)}
                    className="rounded-full bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition duration-200 hover:-translate-y-0.5 hover:bg-brand-50 hover:text-brand-700 hover:shadow-md"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <InlineAlert message={error} />

        {loading ? <LoadingSpinner label="Loading doctors..." center /> : null}

        {!loading ? (
          <section id="doctors" className="space-y-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="section-kicker">Doctor directory</p>
                <h3 className="section-title">Recommended specialists</h3>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="rounded-full bg-white px-4 py-2 text-sm text-slate-500 ring-1 ring-slate-200 shadow-sm">
                  Showing <span className="font-semibold text-slate-900">{filteredDoctors.length}</span>{' '}
                  doctor{filteredDoctors.length === 1 ? '' : 's'}
                </p>
                <button type="button" onClick={reloadDoctors} className="secondary-button px-4 py-2 text-sm">
                  Refresh
                </button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
              {filteredDoctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} onBook={onBookDoctor} />
              ))}
            </div>

            {filteredDoctors.length === 0 ? (
              <div className="soft-card px-6 py-14 text-center sm:px-8">
                <p className="text-lg font-semibold text-slate-900">No doctors matched your search.</p>
                <p className="mt-2 text-sm text-slate-500">
                  Try searching by another specialty or clinic location.
                </p>
              </div>
            ) : null}
          </section>
        ) : null}
      </section>
    </div>
  );
}

export default HomePage;
