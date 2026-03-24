function DoctorCard({ doctor, onBook }) {
  return (
    <article className="group soft-card overflow-hidden p-6 transition duration-300 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-[0_24px_60px_-28px_rgba(37,99,235,0.28)] sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-xl font-bold text-brand-700 ring-1 ring-brand-100">
            {doctor.initials}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-700">
              {doctor.specialty}
            </p>
            <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">{doctor.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{doctor.experience} years experience</p>
          </div>
        </div>

        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
          {doctor.availability}
        </span>
      </div>

      <p className="mt-5 text-sm leading-7 text-slate-600">{doctor.description}</p>

      <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-slate-600">
        <div className="rounded-2xl bg-slate-50 px-4 py-3.5 ring-1 ring-slate-100">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Rating</p>
          <p className="mt-1.5 font-semibold text-slate-900">⭐ {doctor.rating}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3.5 ring-1 ring-slate-100">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Consultation</p>
          <p className="mt-1.5 font-semibold text-slate-900">{doctor.fee}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-medium text-slate-500">{doctor.location}</span>
        <button type="button" onClick={() => onBook(doctor)} className="secondary-button px-4 py-2.5 text-sm">
          Book Now
        </button>
      </div>
    </article>
  );
}

export default DoctorCard;
