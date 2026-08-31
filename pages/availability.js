import { useState } from 'react';
import { useRouter } from 'next/router';
import { useApi } from '@/lib/useApi';
import { api } from '@/lib/api';
import { todayDateStr } from '@/lib/dateUtils';
import PageHeader from '@/components/ui/PageHeader';
import Drawer from '@/components/ui/Drawer';
import BookingQuickView from '@/components/ui/BookingQuickView';
import LoadingState from '@/components/ui/LoadingState';
import EmptyState from '@/components/ui/EmptyState';
import { FLOOR_LABELS } from '@/lib/constants';

function fmtHour(h) {
  const [hh] = h.split(':').map(Number);
  const period = hh >= 12 ? 'PM' : 'AM';
  const hour = hh % 12 === 0 ? 12 : hh % 12;
  return `${hour} ${period}`;
}

export default function AvailabilityPage() {
  const router = useRouter();
  const [date, setDate] = useState(todayDateStr());
  const [selectedBooking, setSelectedBooking] = useState(null);

  const { data: timeline, loading, error } = useApi(`/availability/timeline?date=${date}`, [date]);

  const [checkForm, setCheckForm] = useState({ floor: '', start: '09:00', end: '10:00' });
  const [checkResult, setCheckResult] = useState(null);
  const [checking, setChecking] = useState(false);

  async function runCheck(floorOverride, startOverride, endOverride) {
    const floor = floorOverride ?? checkForm.floor;
    const start = startOverride ?? checkForm.start;
    const end = endOverride ?? checkForm.end;
    if (!floor || !start || !end) return;
    setChecking(true);
    try {
      const result = await api.get(`/availability/check?floor=${floor}&date=${date}&start=${start}&end=${end}`);
      setCheckResult({ ...result, floor, start, end });
    } finally {
      setChecking(false);
    }
  }

  function openSlot(floorKey, hour) {
    const nextHour = String(Number(hour.split(':')[0]) + 1).padStart(2, '0') + ':00';
    setCheckForm({ floor: floorKey, start: hour, end: nextHour });
    setCheckResult(null);
    runCheck(floorKey, hour, nextHour);
  }

  return (
    <>
      <PageHeader title="Availability" subtitle="Check floor and resource availability before creating a booking." />

      <div className="card p-4 sm:p-5 mb-5">
        <div className="flex flex-wrap items-end gap-3 mb-5">
          <div>
            <label className="field-label">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field-input" />
          </div>
        </div>

        {loading || !timeline ? (
          error ? (
            <EmptyState title="Unable to load availability" description={error.message} />
          ) : (
            <LoadingState rows={5} />
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="text-left font-medium text-ink-500 px-2 py-2 sticky left-0 bg-white">Floor</th>
                  {timeline.hours.slice(0, -1).map((h) => (
                    <th key={h} className="text-center font-medium text-ink-400 px-1 py-2 min-w-[64px]">{fmtHour(h)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeline.grid.map((row) => (
                  <tr key={row.floor} className="border-t border-ink-100">
                    <td className="px-2 py-2 font-medium text-ink-800 sticky left-0 bg-white whitespace-nowrap">{row.floorName}</td>
                    {row.slots.map((slot) => (
                      <td key={slot.hour} className="p-1">
                        {slot.status === 'available' ? (
                          <button
                            onClick={() => openSlot(row.floor, slot.hour)}
                            className="w-full h-9 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-[10px] font-medium"
                          >
                            Open
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              setSelectedBooking({
                                _id: slot.bookingId,
                                eventName: slot.eventName,
                                floor: row.floor,
                                date,
                                startTime: slot.startTime,
                                endTime: slot.endTime,
                                status: 'confirmed',
                                organiser: {},
                              })
                            }
                            className="w-full h-9 rounded bg-ink-100 border border-ink-200 text-ink-500 hover:bg-ink-200 text-[10px] font-medium truncate px-1"
                            title={slot.eventName}
                          >
                            Booked
                          </button>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center gap-4 mt-3 text-xs text-ink-500">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-100 border border-emerald-200" /> Available</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-ink-100 border border-ink-200" /> Booked</span>
            </div>
          </div>
        )}
      </div>

      <div className="card p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-ink-900 mb-4">Check a Specific Window</h2>
        <div className="grid sm:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="field-label">Floor</label>
            <select className="field-input" value={checkForm.floor} onChange={(e) => setCheckForm((f) => ({ ...f, floor: e.target.value }))}>
              <option value="">Select floor</option>
              {(timeline?.grid || []).map((r) => (
                <option key={r.floor} value={r.floor}>{r.floorName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Start Time</label>
            <input type="time" className="field-input" value={checkForm.start} onChange={(e) => setCheckForm((f) => ({ ...f, start: e.target.value }))} />
          </div>
          <div>
            <label className="field-label">End Time</label>
            <input type="time" className="field-input" value={checkForm.end} onChange={(e) => setCheckForm((f) => ({ ...f, end: e.target.value }))} />
          </div>
          <div className="flex items-end">
            <button className="btn-primary w-full" onClick={() => runCheck()} disabled={checking}>
              {checking ? 'Checking…' : 'Check Availability'}
            </button>
          </div>
        </div>

        {checkResult && (
          <div className={`rounded-lg border p-4 ${checkResult.available ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'}`}>
            <p className="text-sm font-semibold mb-1">
              {FLOOR_LABELS[checkResult.floor]} · {checkResult.start}–{checkResult.end}
            </p>
            {checkResult.available ? (
              <>
                <p className="text-sm text-emerald-700 font-medium mb-3">AVAILABLE</p>
                {checkResult.resources.length > 0 && (
                  <div className="grid sm:grid-cols-2 gap-2 mb-3">
                    {checkResult.resources.map((r) => (
                      <div key={r.resourceId} className="text-xs text-ink-600 flex justify-between border-b border-ink-100 py-1">
                        <span>{r.name}</span>
                        <span className="font-medium text-ink-800">{r.available} available</span>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  className="btn-primary"
                  onClick={() =>
                    router.push(
                      `/bookings/new?floor=${checkResult.floor}&date=${date}&start=${checkResult.start}&end=${checkResult.end}`
                    )
                  }
                >
                  Continue Booking
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-red-700 font-medium mb-2">CONFLICT DETECTED</p>
                {checkResult.conflicts.map((c) => (
                  <p key={c.id} className="text-sm text-ink-600 mb-2">
                    Already reserved by <span className="font-medium">{c.eventName}</span> from {c.startTime} to {c.endTime}.
                  </p>
                ))}
                <button className="btn-secondary" onClick={() => document.getElementById('__next')?.scrollTo(0, 0)}>
                  View Available Slots Above
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <Drawer open={!!selectedBooking} onClose={() => setSelectedBooking(null)} title="Booking">
        <BookingQuickView booking={selectedBooking} />
      </Drawer>
    </>
  );
}
