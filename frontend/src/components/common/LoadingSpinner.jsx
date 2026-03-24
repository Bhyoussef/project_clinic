function LoadingSpinner({ label = 'Loading...', center = false }) {
  return (
    <div className={center ? 'flex min-h-[240px] items-center justify-center' : 'flex items-center gap-3'}>
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-brand-700" />
      <span className="text-sm font-medium text-slate-500">{label}</span>
    </div>
  );
}

export default LoadingSpinner;
