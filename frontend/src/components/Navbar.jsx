function Navbar({ onOpenDashboard, onOpenAdmin, onOpenLogin, onLogout, user }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-700 to-slate-900 text-lg font-bold text-white shadow-lg shadow-brand-700/25">
            C
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-brand-700 sm:text-xs">
              Clinic Care
            </p>
            <h1 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
              Find Your Doctor
            </h1>
          </div>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex">
          <a href="#doctors" className="transition hover:text-slate-900">
            Doctors
          </a>
          <a href="#specialties" className="transition hover:text-slate-900">
            Specialties
          </a>
          <button type="button" onClick={onOpenDashboard} className="transition hover:text-slate-900">
            Doctor Dashboard
          </button>
          <button type="button" onClick={onOpenAdmin} className="transition hover:text-slate-900">
            Admin Panel
          </button>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <div className="hidden rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-600 sm:block">
              Signed in as <span className="font-semibold text-slate-900">{user.name || user.phone}</span>
            </div>
          ) : null}

          {user ? (
            <button type="button" onClick={onLogout} className="secondary-button px-4 py-2.5 text-xs sm:px-5 sm:text-sm">
              Logout
            </button>
          ) : (
            <button type="button" onClick={onOpenLogin} className="secondary-button px-4 py-2.5 text-xs sm:px-5 sm:text-sm">
              Login
            </button>
          )}

          <button type="button" onClick={onOpenAdmin} className="secondary-button px-4 py-2.5 text-xs sm:px-5 sm:text-sm">
            Admin
          </button>
          <button type="button" onClick={onOpenDashboard} className="primary-button px-4 py-2.5 text-xs sm:px-5 sm:text-sm">
            Dashboard
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
