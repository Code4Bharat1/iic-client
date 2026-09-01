export default function Stepper({ steps, current }) {
  return (
    <ol className="flex items-center w-full overflow-x-auto pb-1 mb-6 gap-1 sm:gap-0">
      {steps.map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'upcoming';
        return (
          <li key={label} className="flex items-center flex-1 min-w-[92px]">
            <div className="flex items-center gap-2">
              <div
                className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold border transition-all duration-200 ${
                  state === 'done'
                    ? 'bg-brand-800 border-brand-800 text-white'
                    : state === 'active'
                    ? 'border-brand-800 text-brand-800 bg-white ring-4 ring-brand-100'
                    : 'border-ink-200 text-ink-400 bg-white'
                }`}
              >
                {state === 'done' ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>
                ) : (
                  String(i + 1).padStart(2, '0')
                )}
              </div>
              <span className={`text-xs whitespace-nowrap hidden sm:inline transition-colors duration-200 ${state === 'active' ? 'font-semibold text-ink-900' : state === 'upcoming' ? 'font-medium text-ink-400' : 'font-medium text-ink-800'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && <div className={`h-px flex-1 mx-2 ${state === 'done' ? 'bg-brand-800' : 'bg-ink-200'}`} />}
          </li>
        );
      })}
    </ol>
  );
}
