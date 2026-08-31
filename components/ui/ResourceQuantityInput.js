export default function ResourceQuantityInput({ resource, quantity, onChange, error }) {
  const isToggle = resource.unitType === 'toggle';

  if (isToggle) {
    const on = quantity > 0;
    return (
      <div className={`flex items-center justify-between rounded-md border px-3.5 py-3 ${error ? 'border-red-300 bg-red-50/40' : 'border-ink-200'}`}>
        <div>
          <p className="text-sm font-medium text-ink-900">{resource.name}</p>
          <p className="text-xs text-ink-500">{resource.available > 0 ? 'Available' : 'Not available for this period'}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          disabled={resource.available <= 0 && !on}
          onClick={() => onChange(on ? 0 : 1)}
          className={`h-6 w-11 rounded-full transition-colors relative shrink-0 disabled:opacity-40 ${on ? 'bg-brand-800' : 'bg-ink-200'}`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
        </button>
      </div>
    );
  }

  return (
    <div className={`rounded-md border px-3.5 py-3 ${error ? 'border-red-300 bg-red-50/40' : 'border-ink-200'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-ink-900">{resource.name}</p>
          <p className="text-xs text-ink-500">Available: {resource.available}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange(Math.max(0, quantity - 1))}
            className="h-7 w-7 rounded-md border border-ink-200 text-ink-600 hover:bg-ink-50 flex items-center justify-center"
            aria-label={`Decrease ${resource.name}`}
          >
            −
          </button>
          <input
            type="number"
            min={0}
            value={quantity}
            onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
            className="w-14 text-center rounded-md border border-ink-200 py-1 text-sm"
          />
          <button
            type="button"
            onClick={() => onChange(quantity + 1)}
            className="h-7 w-7 rounded-md border border-ink-200 text-ink-600 hover:bg-ink-50 flex items-center justify-center"
            aria-label={`Increase ${resource.name}`}
          >
            +
          </button>
        </div>
      </div>
      {quantity > 0 && (
        <p className={`mt-2 text-xs ${quantity > resource.available ? 'text-red-600 font-medium' : 'text-ink-500'}`}>
          {quantity > resource.available
            ? `Requested quantity exceeds available inventory by ${quantity - resource.available}.`
            : `Remaining after this request: ${resource.available - quantity}`}
        </p>
      )}
    </div>
  );
}
