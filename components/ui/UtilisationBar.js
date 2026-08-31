export default function UtilisationBar({ label, percent, sublabel }) {
  const pct = Math.max(0, Math.min(100, percent || 0));
  const tone = pct >= 75 ? 'bg-red-500' : pct >= 45 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-sm font-medium text-ink-800">{label}</span>
        <span className="text-sm tabular-nums text-ink-600">
          {pct}% {sublabel && <span className="text-ink-400">· {sublabel}</span>}
        </span>
      </div>
      <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
        <div className={`h-full rounded-full ${tone} transition-[width] duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
