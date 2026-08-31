import { STATUS_LABELS, STATUS_STYLES } from '@/lib/constants';

export default function StatusBadge({ status, className = '' }) {
  const style = STATUS_STYLES[status] || 'bg-ink-100 text-ink-600 border-ink-200';
  const label = STATUS_LABELS[status] || status;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${style} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      {label}
    </span>
  );
}
