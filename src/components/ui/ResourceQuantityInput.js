export default function ResourceQuantityInput({ resource, quantity, onChange, error }) {
  const isToggle = resource.unitType === 'toggle';
  const max = resource.available ?? 0;

  if (isToggle) {
    const on = quantity > 0;
    return (
      <div className={`flex items-center justify-between rounded-md border px-3.5 py-3 ${error ? 'border-red-300 bg-red-50/40' : 'border-ink-200'}`}>
        <div>
          <p className="text-sm font-medium text-ink-900">{resource.name}</p>
          <p className="text-xs text-ink-500">{max > 0 ? 'Available' : 'Not available for this period'}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          disabled={max <= 0 && !on}
          onClick={() => onChange(on ? 0 : 1)}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed ${
            on ? 'bg-brand-800' : 'bg-ink-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
              on ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    );
  }

  const atMax = quantity >= max;
  const fullyReserved = max <= 0;

  return (
    <div className={`rounded-md border px-3.5 py-3 ${error ? 'border-red-300 bg-red-50/40' : fullyReserved ? 'border-ink-200 bg-ink-50/60 opacity-60' : 'border-ink-200'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-ink-900">{resource.name}</p>
          {fullyReserved ? (
            <p className="text-xs text-red-500 font-medium">Fully reserved for this period</p>
          ) : (
            <p className="text-xs text-ink-500">Available: <span className="font-semibold text-ink-700">{max}</span></p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={quantity <= 0}
            onClick={() => onChange(Math.max(0, quantity - 1))}
            className="h-7 w-7 rounded-md border border-ink-200 text-ink-600 hover:bg-ink-50 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label={`Decrease ${resource.name}`}
          >
            −
          </button>
          <input
            type="number"
            min={0}
            max={max}
            disabled={fullyReserved}
            value={quantity}
            onChange={(e) => {
              const val = Math.min(max, Math.max(0, Number(e.target.value) || 0));
              onChange(val);
            }}
            className="w-14 text-center rounded-md border border-ink-200 py-1 text-sm disabled:opacity-40"
          />
          <button
            type="button"
            disabled={atMax || fullyReserved}
            onClick={() => onChange(Math.min(max, quantity + 1))}
            className="h-7 w-7 rounded-md border border-ink-200 text-ink-600 hover:bg-ink-50 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label={`Increase ${resource.name}`}
          >
            +
          </button>
        </div>
      </div>
      {quantity > 0 && !fullyReserved && (
        <p className={`mt-2 text-xs ${quantity > max ? 'text-red-600 font-medium' : 'text-ink-500'}`}>
          {quantity > max
            ? `Requested quantity exceeds available inventory by ${quantity - max}.`
            : `Remaining after this request: ${max - quantity}`}
        </p>
      )}
    </div>
  );
}
