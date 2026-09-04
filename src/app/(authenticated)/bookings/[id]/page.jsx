'use client';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import BookingLifecycle from '@/components/ui/BookingLifecycle';
import LoadingState from '@/components/ui/LoadingState';
import EmptyState from '@/components/ui/EmptyState';
import { FLOOR_LABELS, formatDate, formatTimeRange } from '@/lib/constants';

function Section({ title, children }) {
  return (
    <div className="card p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-ink-900 mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-ink-50 last:border-0">
      <dt className="text-sm text-ink-500">{label}</dt>
      <dd className="text-sm text-ink-800 font-medium text-right">{value || '—'}</dd>
    </div>
  );
}

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const { user } = useAuth();
  const { data: booking, loading, error } = useApi(id ? `/bookings/${id}` : null, [id]);

  if (loading || !user) return <LoadingState rows={8} />;
  if (error || !booking) return <EmptyState title="Unable to load booking" description={error?.message} />;

  const isOwner = booking.createdBy === user.userId;
  const canManage = user.role === 'admin' || user.role === 'master_admin';
  const resourceLines = booking.resources || [];

  return (
    <>
      <PageHeader
        title={booking.eventName}
        subtitle={booking.bookingRef}
        actions={
          <>
            <StatusBadge status={booking.status} />
            {canManage && ['pending_approval', 'change_requested'].includes(booking.status) && (
              <Link href={`/approvals/${booking._id}`} className="btn-primary">Review in Approval Queue</Link>
            )}
            {['confirmed', 'event_in_progress', 'awaiting_closure', 'issue_reported'].includes(booking.status) && (
              <Link href={`/events/${booking._id}`} className="btn-secondary">Event-Day View</Link>
            )}
            {booking.status === 'awaiting_closure' && (isOwner || canManage) && (
              <Link href={`/closure/${booking._id}`} className="btn-secondary">Go to Closure</Link>
            )}
            {booking.status === 'change_requested' && isOwner && (
              <Link href={`/bookings/${booking._id}/edit`} className="btn-primary">Edit &amp; Resubmit</Link>
            )}
          </>
        }
      />

      <div className="card p-4 sm:p-5 mb-5">
        <BookingLifecycle status={booking.status} />
      </div>

      {booking.status === 'change_requested' && booking.adminComment && (
        <div className="rounded-md border border-violet-200 bg-violet-50 px-4 py-3 mb-5 text-sm text-violet-800">
          <p className="font-medium mb-0.5">Admin requested changes</p>
          {booking.adminComment}
        </div>
      )}
      {booking.status === 'rejected' && booking.rejectionReason && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 mb-5 text-sm text-red-800">
          <p className="font-medium mb-0.5">Rejection reason</p>
          {booking.rejectionReason}
        </div>
      )}
      {booking.conflictOverride?.overridden && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 mb-5 text-sm text-amber-800">
          <p className="font-medium mb-0.5">Conflict override applied by {booking.conflictOverride.by}</p>
          {booking.conflictOverride.reason}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        <Section title="Event Details">
          <dl>
            <Row label="Event Name" value={booking.eventName} />
            <Row label="Purpose" value={booking.purpose} />
            <Row label="Expected Attendance" value={booking.expectedAttendance} />
          </dl>
        </Section>

        <Section title="Organiser">
          <dl>
            <Row label="Name" value={booking.organiser?.name} />
            <Row label="Authorised User ID" value={booking.organiser?.userId} />
            <Row label="Department" value={booking.organiser?.department} />
            <Row label="Mobile" value={booking.organiser?.mobile} />
            <Row label="Email" value={booking.organiser?.email} />
          </dl>
        </Section>

        <Section title="Venue & Schedule">
          <dl>
            <Row label="Floor" value={FLOOR_LABELS[booking.floor]} />
            <Row label="Date" value={formatDate(booking.date)} />
            <Row label="Time" value={formatTimeRange(booking.startTime, booking.endTime)} />
          </dl>
        </Section>

        <Section title="Approved Resources">
          {resourceLines.length === 0 ? (
            <p className="text-sm text-ink-500">No resources requested.</p>
          ) : (
            <dl>
              {resourceLines.map((r) => (
                <Row key={r.resource} label={r.name} value={r.unitType === 'toggle' ? 'Requested' : r.quantity} />
              ))}
            </dl>
          )}
        </Section>

        <Section title="Arrangement Contact">
          {booking.arrangementContact ? (
            <dl>
              <Row label="Name" value={booking.arrangementContact.name} />
              <Row label="Role" value={booking.arrangementContact.role} />
              <Row label="Phone" value={booking.arrangementContact.phone} />
              <Row label="Email" value={booking.arrangementContact.email} />
            </dl>
          ) : (
            <p className="text-sm text-ink-500">No arrangement contact assigned yet.</p>
          )}
        </Section>

        <Section title="Special Instructions">
          <p className="text-sm text-ink-700 whitespace-pre-wrap">{booking.specialRequirements || 'None provided.'}</p>
        </Section>
      </div>
    </>
  );
}
