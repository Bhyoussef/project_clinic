function InlineAlert({ tone = 'error', message }) {
  if (!message) {
    return null;
  }

  const tones = {
    error: 'border-rose-200 bg-rose-50 text-rose-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    info: 'border-brand-200 bg-brand-50 text-brand-700',
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${tones[tone] || tones.error}`}>
      {message}
    </div>
  );
}

export default InlineAlert;
