'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApi } from '@/hooks/useApi';
import LoadingState from '@/components/ui/LoadingState';
import EmptyState from '@/components/ui/EmptyState';
import { FLOOR_LABELS, STATUS_LABELS, formatDate, formatTimeRange } from '@/lib/constants';

const BANNER_STYLES = {
  confirmed: 'bg-emerald-600',
  event_in_progress: 'bg-blue-600',
  awaiting_closure: 'bg-orange-600',
  issue_reported: 'bg-rose-600',
};

export default function EventDayPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: booking, loading } = useApi(id ? `/bookings/${id}` : null, [id]);

  if (loading) return <LoadingState rows={8} />;
  if (!booking) return <EmptyState title="Event not found" />;

  const banner = BANNER_STYLES[booking.status] || 'bg-ink-700';

  return (
    <div className="max-w-2xl mx-auto">
      <div className={`rounded-lg ${banner} text-white px-6 py-6 mb-5`}>
        <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{STATUS_LABELS[booking.status]}</p>
        <h1 className="text-xl sm:text-2xl font-semibold mt-1">{booking.eventName}</h1>
        <p className="text-sm opacity-90 mt-1">{FLOOR_LABELS[booking.floor]} · {formatTimeRange(booking.startTime, booking.endTime)}</p>
      </div>

      <div className="card p-5 space-y-5">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-ink-500">Booking ID</p>
            <p className="font-medium text-ink-900">{booking.bookingRef}</p>
          </div>
          <div>
            <p className="text-ink-500">Date</p>
            <p className="font-medium text-ink-900">{formatDate(booking.date)}</p>
          </div>
          <div>
            <p className="text-ink-500">Organiser</p>
            <p className="font-medium text-ink-900">{booking.organiser?.name}</p>
          </div>
          <div>
            <p className="text-ink-500">Contact</p>
            <p className="font-medium text-ink-900">{booking.organiser?.mobile || '—'}</p>
          </div>
          <div>
            <p className="text-ink-500">Attendance</p>
            <p className="font-medium text-ink-900">{booking.expectedAttendance}</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2">Approved Resources</p>
          {booking.resources.length === 0 ? (
            <p className="text-sm text-ink-500">No resources reserved.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-2">
              {booking.resources.map((r) => (
                <li key={r.resource} className="text-sm bg-ink-50 rounded px-3 py-2 flex justify-between">
                  <span>{r.name}</span>
                  <span className="font-medium">{r.unitType === 'toggle' ? '✓' : r.quantity}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {booking.arrangementContact && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2">Arrangement Contact</p>
            <p className="text-sm text-ink-800">{booking.arrangementContact.name} · {booking.arrangementContact.phone}</p>
          </div>
        )}

        {booking.specialRequirements && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2">Special Instructions</p>
            <p className="text-sm text-ink-700">{booking.specialRequirements}</p>
          </div>
        )}

        {booking.status === 'awaiting_closure' && (
          <Link href={`/closure/${booking._id}`} className="btn-primary w-full">
            Complete Event Closure
          </Link>
        )}
      </div>
    </div>
  );
}
