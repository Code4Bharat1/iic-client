'use client';
import { useEffect, useRef, useState } from 'react';

// Dropdown checklist for picking the floor(s) a floor-scoped resource's
// quantity is pooled across (booking on one selected floor deducts from
// availability on the others during overlapping time slots).
export default function FloorMultiSelect({ floors, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function toggle(key) {
    onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);
  }

  return (
    <div className="relative" ref={ref}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="field-label mb-0">Assigned Floor(s)</label>
        {selected.length > 0 && (
          <span className="text-xs text-ink-500 font-normal">
            {selected.length === floors.length ? 'All floors selected' : `${selected.length} of ${floors.length} selected`}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="field-input flex items-center justify-between min-h-[40px] text-left cursor-pointer hover:border-ink-300 transition-colors"
      >
        <div className="flex-1 truncate pr-2">
          {selected.length === 0 ? (
            <span className="text-ink-400 text-sm">Select floor(s)...</span>
          ) : (
            <div className="flex flex-wrap gap-1.5 items-center">
              {floors
                .filter((f) => selected.includes(f.key))
                .map((f) => (
                  <span
                    key={f.key}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand-50 text-brand-900 border border-brand-200"
                  >
                    {f.name}
                  </span>
                ))}
            </div>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-ink-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-ink-700' : ''}`}
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
        >
          <path d="M6 8l4 4 4-4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-ink-200 rounded-lg shadow-lg p-2.5 space-y-2">
          <div className="flex items-center justify-between px-1 pb-1.5 border-b border-ink-100 text-xs">
            <span className="font-medium text-ink-700">{selected.length} of {floors.length} selected</span>
            <button
              type="button"
              onClick={() => onChange(selected.length === floors.length ? [] : floors.map((f) => f.key))}
              className="text-brand-700 hover:text-brand-900 font-medium cursor-pointer"
            >
              {selected.length === floors.length ? 'Deselect all' : 'Select all'}
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1 py-0.5">
            {floors.map((f) => {
              const isChecked = selected.includes(f.key);
              return (
                <label
                  key={f.key}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                    isChecked ? 'bg-brand-50/70 text-brand-900' : 'hover:bg-ink-50 text-ink-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggle(f.key)}
                    className="rounded border-ink-300 text-brand-800 focus:ring-brand-600 h-4 w-4 cursor-pointer"
                  />
                  <span>{f.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {selected.length === 0 && <p className="text-xs text-red-600 mt-1">Please select at least one floor.</p>}
    </div>
  );
}
