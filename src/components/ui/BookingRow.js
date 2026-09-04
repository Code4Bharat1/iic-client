import { useRouter } from 'next/navigation';
import StatusBadge from './StatusBadge';
import { FLOOR_LABELS, formatDate, formatTimeRange } from '@/lib/constants';

export default function BookingRow({ booking }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(`/bookings/${booking._id}`)}
      className="w-full flex items-center justify-between gap-4 px-4 py-3.5 border-b border-ink-100 last:border-0 hover:bg-ink-50/70 text-left transition-colors"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink-900 truncate">{booking.eventName}</p>
        <p className="text-xs text-ink-500 mt-0.5">
          {booking.bookingRef} · {FLOOR_LABELS[booking.floor]} · {formatDate(booking.date)} · {formatTimeRange(booking.startTime, booking.endTime)}
        </p>
      </div>
      <StatusBadge status={booking.status} />
    </button>
  );
}
