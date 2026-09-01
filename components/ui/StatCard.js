export default function StatCard({ label, value, hint, tone = 'default', icon }) {
  const toneStyles = {
    default: 'text-ink-900',
    warning: 'text-amber-700',
    danger: 'text-red-700',
    success: 'text-brand-700',
  };
  return (
    <div className="card p-4 sm:p-5 transition-shadow duration-150 hover:shadow-raised">
      <div className="flex items-start justify-between">
        <p className="text-[13px] font-medium text-ink-500 tracking-[-0.005em]">{label}</p>
        {icon && <span className="text-ink-400">{icon}</span>}
      </div>
      <p className={`mt-2 font-display text-[1.85rem] sm:text-[2.1rem] leading-none tabular-nums ${toneStyles[tone]}`}>{value}</p>
      {hint && <p className="mt-2 text-xs text-ink-500">{hint}</p>}
    </div>
  );
}
