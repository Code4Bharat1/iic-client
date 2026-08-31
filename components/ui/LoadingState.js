export default function LoadingState({ rows = 4 }) {
  return (
    <div className="p-6 space-y-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 rounded bg-ink-100 animate-pulse" style={{ width: `${85 - i * 8}%` }} />
      ))}
    </div>
  );
}
