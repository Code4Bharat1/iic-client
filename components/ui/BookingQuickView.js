import Link from 'next/link';
import StatusBadge from './StatusBadge';
import { FLOOR_LABELS, formatDate, formatTimeRange } from '@/lib/constants';

export default function BookingQuickView({ booking }) {
  if (!booking) return null;
  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="text-base font-semibold text-ink-900">{booking.eventName}</p>
          <p className="text-xs text-ink-500 mt-0.5">{booking.bookingRef}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <dl className="space-y-2.5 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-500">Floor</dt>
          <dd className="text-ink-800 font-medium">{FLOOR_LABELS[booking.floor]}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-500">Date</dt>
          <dd className="text-ink-800 font-medium">{formatDate(booking.date)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-500">Time</dt>
          <dd className="text-ink-800 font-medium">{formatTimeRange(booking.startTime, booking.endTime)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-500">Organiser</dt>
          <dd className="text-ink-800 font-medium">{booking.organiser?.name}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-500">Attendance</dt>
          <dd className="text-ink-800 font-medium">{booking.expectedAttendance}</dd>
        </div>
      </dl>

      <Link href={`/bookings/${booking._id}`} className="btn-primary w-full mt-5">
        View Full Details
      </Link>
    </div>
  );
}
