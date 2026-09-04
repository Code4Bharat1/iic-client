export default function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="h-11 w-11 rounded-xl bg-ink-100 flex items-center justify-center mb-3">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-ink-400">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 2v4M16 2v4" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-ink-800">{title}</p>
      {description && <p className="mt-1 text-sm text-ink-500 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
