export default function StatCard({ label, value, hint, tone = 'default', icon }) {
  const toneStyles = {
    default: 'text-ink-900',
    warning: 'text-amber-600',
    danger: 'text-red-600',
    success: 'text-emerald-600',
  };
  return (
    <div className="card p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-ink-500">{label}</p>
        {icon && <span className="text-ink-400">{icon}</span>}
      </div>
      <p className={`mt-2 text-2xl sm:text-3xl font-semibold tabular-nums ${toneStyles[tone]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
    </div>
  );
}
