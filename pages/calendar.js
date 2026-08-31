import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useApi } from '@/lib/useApi';
import { useBookableFloors } from '@/lib/floorOptions';
import PageHeader from '@/components/ui/PageHeader';
import { Select } from '@/components/ui/FilterBar';
import Drawer from '@/components/ui/Drawer';
import BookingQuickView from '@/components/ui/BookingQuickView';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingState from '@/components/ui/LoadingState';
import { FLOOR_LABELS, STATUS_LABELS, formatTimeRange } from '@/lib/constants';
import { addDays, monthMatrix, startOfWeek, toDateStr, todayDateStr, WEEKDAY_LABELS, MONTH_LABELS } from '@/lib/dateUtils';

const STATUS_OPTIONS = [
  'pending_approval', 'change_requested', 'confirmed', 'event_in_progress',
  'awaiting_closure', 'issue_reported', 'closed', 'rejected',
];

function useRangeBookings(from, to, floor, status) {
  const params = new URLSearchParams({ from, to });
  if (floor) params.set('floor', floor);
  if (status) params.set('status', status);
  return useApi(`/bookings?${params.toString()}`, [from, to, floor, status]);
}

export default function CalendarPage() {
  const today = new Date();
  const [view, setView] = useState('month');
  const [cursor, setCursor] = useState(today);
  const [floor, setFloor] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const floors = useBookableFloors();

  const range = useMemo(() => {
    if (view === 'month') {
      const weeks = monthMatrix(cursor.getFullYear(), cursor.getMonth());
      return { from: toDateStr(weeks[0][0]), to: toDateStr(weeks[5][6]), weeks };
    }
    if (view === 'week') {
      const start = startOfWeek(cursor);
      const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
      return { from: toDateStr(days[0]), to: toDateStr(days[6]), days };
    }
    return { from: toDateStr(cursor), to: toDateStr(cursor) };
  }, [view, cursor]);

  const { data: bookings, loading } = useRangeBookings(range.from, range.to, floor, status);
  const byDate = useMemo(() => {
    const map = {};
    (bookings || []).forEach((b) => {
      map[b.date] = map[b.date] || [];
      map[b.date].push(b);
    });
    Object.values(map).forEach((list) => list.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    return map;
  }, [bookings]);

  function shift(delta) {
    if (view === 'month') setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));
    else if (view === 'week') setCursor(addDays(cursor, delta * 7));
    else setCursor(addDays(cursor, delta));
  }

  const heading =
    view === 'month'
      ? `${MONTH_LABELS[cursor.getMonth()]} ${cursor.getFullYear()}`
      : view === 'week'
      ? `Week of ${range.days[0].toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`
      : cursor.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <>
      <PageHeader title="Calendar" subtitle="Floor bookings across the institution." actions={<Link href="/bookings/new" className="btn-primary">+ New Booking</Link>} />

      <div className="card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => shift(-1)} className="btn-secondary !px-2.5" aria-label="Previous">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6l-6 6 6 6" /></svg>
            </button>
            <button onClick={() => setCursor(new Date())} className="btn-secondary">Today</button>
            <button onClick={() => shift(1)} className="btn-secondary !px-2.5" aria-label="Next">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
            </button>
            <h2 className="text-sm font-semibold text-ink-900 ml-2">{heading}</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={floor}
              onChange={setFloor}
              ariaLabel="Filter by floor"
              options={[{ value: '', label: 'All Floors' }, ...floors.map((f) => ({ value: f.key, label: f.name }))]}
            />
            <Select
              value={status}
              onChange={setStatus}
              ariaLabel="Filter by status"
              options={[{ value: '', label: 'All Status' }, ...STATUS_OPTIONS.map((s) => ({ value: s, label: STATUS_LABELS[s] }))]}
            />
            <div className="flex rounded-md border border-ink-200 overflow-hidden">
              {['month', 'week', 'day'].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-sm capitalize ${view === v ? 'bg-brand-800 text-white' : 'bg-white text-ink-600 hover:bg-ink-50'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingState rows={8} />
        ) : view === 'month' ? (
          <MonthGrid weeks={range.weeks} byDate={byDate} currentMonth={cursor.getMonth()} onSelect={setSelected} />
        ) : view === 'week' ? (
          <AgendaColumns days={range.days} byDate={byDate} onSelect={setSelected} />
        ) : (
          <DayAgenda date={cursor} bookings={byDate[toDateStr(cursor)] || []} onSelect={setSelected} />
        )}
      </div>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title="Booking">
        <BookingQuickView booking={selected} />
      </Drawer>
    </>
  );
}

function EventChip({ booking, onSelect }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onSelect(booking);
      }}
      className="w-full text-left text-[11px] leading-tight rounded px-1.5 py-1 bg-brand-50 text-brand-800 border border-brand-100 hover:bg-brand-100 truncate"
      title={`${booking.eventName} · ${FLOOR_LABELS[booking.floor]} · ${formatTimeRange(booking.startTime, booking.endTime)}`}
    >
      <span className="font-medium">{booking.startTime}</span> {booking.eventName}
    </button>
  );
}

function MonthGrid({ weeks, byDate, currentMonth, onSelect }) {
  const today = todayDateStr();
  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-ink-400 py-1.5">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px bg-ink-100 rounded-md overflow-hidden border border-ink-100">
        {weeks.flat().map((day) => {
          const dateStr = toDateStr(day);
          const events = byDate[dateStr] || [];
          const inMonth = day.getMonth() === currentMonth;
          return (
            <div key={dateStr} className={`min-h-[104px] bg-white p-1.5 ${inMonth ? '' : 'bg-ink-50/40'}`}>
              <p className={`text-xs mb-1 ${dateStr === today ? 'inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-800 text-white font-semibold' : inMonth ? 'text-ink-600' : 'text-ink-300'}`}>
                {day.getDate()}
              </p>
              <div className="space-y-1">
                {events.slice(0, 3).map((b) => (
                  <EventChip key={b._id} booking={b} onSelect={onSelect} />
                ))}
                {events.length > 3 && <p className="text-[11px] text-ink-400 px-1">+{events.length - 3} more</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AgendaColumns({ days, byDate, onSelect }) {
  const today = todayDateStr();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
      {days.map((day) => {
        const dateStr = toDateStr(day);
        const events = byDate[dateStr] || [];
        return (
          <div key={dateStr} className="min-w-0">
            <p className={`text-xs font-medium mb-2 ${dateStr === today ? 'text-brand-800' : 'text-ink-500'}`}>
              {WEEKDAY_LABELS[day.getDay()]} {day.getDate()}
            </p>
            <div className="space-y-1.5">
              {events.length === 0 && <p className="text-xs text-ink-300">—</p>}
              {events.map((b) => (
                <button
                  key={b._id}
                  onClick={() => onSelect(b)}
                  className="w-full text-left rounded-md border border-ink-200 px-2 py-1.5 hover:border-brand-500 hover:bg-brand-50/30"
                >
                  <p className="text-xs font-medium text-ink-900 truncate">{b.eventName}</p>
                  <p className="text-[11px] text-ink-500">{formatTimeRange(b.startTime, b.endTime)} · {FLOOR_LABELS[b.floor]}</p>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DayAgenda({ bookings, onSelect }) {
  if (bookings.length === 0) return <p className="text-sm text-ink-500 py-10 text-center">No bookings scheduled for this day.</p>;
  return (
    <div className="space-y-2">
      {bookings.map((b) => (
        <button
          key={b._id}
          onClick={() => onSelect(b)}
          className="w-full flex items-center gap-4 rounded-md border border-ink-200 px-4 py-3 hover:border-brand-500 hover:bg-brand-50/30 text-left"
        >
          <div className="text-sm font-medium text-ink-800 w-32 shrink-0">{formatTimeRange(b.startTime, b.endTime)}</div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink-900 truncate">{b.eventName}</p>
            <p className="text-xs text-ink-500">{FLOOR_LABELS[b.floor]}</p>
          </div>
          <StatusBadge status={b.status} />
        </button>
      ))}
    </div>
  );
}
