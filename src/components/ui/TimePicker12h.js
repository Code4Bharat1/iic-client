/**
 * TimePicker12h
 * A 12-hour AM/PM picker.
 *
 * Props:
 *   value     – string in "HH:mm" 24-hour format (what the app stores internally)
 *   onChange  – called with new "HH:mm" string whenever the user changes any dropdown
 *   className – optional extra class for the wrapper div
 */
export default function TimePicker12h({ value, onChange, className = '' }) {
  // Parse the current 24-h value into parts
  let hour12 = 12, minute = 0, period = 'AM';
  if (value) {
    const [hh, mm] = value.split(':').map(Number);
    period = hh >= 12 ? 'PM' : 'AM';
    hour12 = hh % 12 === 0 ? 12 : hh % 12;
    minute = mm;
  }

  function emit(h12, min, per) {
    // Convert back to 24-h "HH:mm"
    let hh = h12 % 12; // 12 AM → 0, 12 PM → 12
    if (per === 'PM') hh += 12;
    onChange(`${String(hh).padStart(2, '0')}:${String(min).padStart(2, '0')}`);
  }

  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutes = ['00', '15', '30', '45'];

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* Hour */}
      <select
        className="field-input py-1.5 pr-6 text-sm"
        value={hour12}
        onChange={(e) => emit(Number(e.target.value), minute, period)}
        aria-label="Hour"
      >
        {hours.map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>

      <span className="text-ink-500 font-medium select-none">:</span>

      {/* Minute */}
      <select
        className="field-input py-1.5 pr-6 text-sm"
        value={String(minute).padStart(2, '0')}
        onChange={(e) => emit(hour12, Number(e.target.value), period)}
        aria-label="Minute"
      >
        {minutes.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      {/* AM / PM */}
      <select
        className="field-input py-1.5 pr-6 text-sm"
        value={period}
        onChange={(e) => emit(hour12, minute, e.target.value)}
        aria-label="AM or PM"
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}
