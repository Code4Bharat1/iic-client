import { LIFECYCLE_STAGES, STATUS_LABELS } from '@/lib/constants';

const TERMINAL_OFFSHOOTS = ['rejected', 'change_requested', 'issue_reported'];

export default function BookingLifecycle({ status }) {
  const isOffshoot = TERMINAL_OFFSHOOTS.includes(status);
  const activeIndex = isOffshoot
    ? status === 'change_requested'
      ? 0
      : status === 'rejected'
      ? 0
      : 3 // issue_reported sits alongside awaiting_closure
    : LIFECYCLE_STAGES.indexOf(status);

  return (
    <div>
      <ol className="flex items-center w-full overflow-x-auto pb-1">
        {LIFECYCLE_STAGES.map((stage, i) => {
          const done = !isOffshoot && i < activeIndex;
          const active = !isOffshoot && i === activeIndex;
          const activeOffshootHere = isOffshoot && i === activeIndex;
          return (
            <li key={stage} className="flex items-center flex-1 min-w-[86px]">
              <div className="flex flex-col items-center gap-1.5 w-full">
                <div
                  className={`h-3 w-3 rounded-full border-2 ${
                    done
                      ? 'bg-brand-800 border-brand-800'
                      : active
                      ? 'border-brand-800 bg-white'
                      : activeOffshootHere
                      ? 'border-amber-500 bg-white'
                      : 'border-ink-200 bg-white'
                  }`}
                />
                <span className={`text-[11px] text-center leading-tight ${done || active ? 'text-ink-800 font-medium' : 'text-ink-400'}`}>
                  {STATUS_LABELS[stage]}
                </span>
              </div>
              {i < LIFECYCLE_STAGES.length - 1 && (
                <div className={`h-0.5 flex-1 -mt-4 ${done ? 'bg-brand-800' : 'bg-ink-200'}`} />
              )}
            </li>
          );
        })}
      </ol>
      {isOffshoot && (
        <p className="text-xs text-amber-700 font-medium mt-2">Current status: {STATUS_LABELS[status]}</p>
      )}
    </div>
  );
}
