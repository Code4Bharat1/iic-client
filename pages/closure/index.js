import { useRouter } from 'next/router';
import { useApi } from '@/lib/useApi';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { FLOOR_LABELS, formatDate, formatTimeRange } from '@/lib/constants';

export default function ClosurePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: awaiting, loading: l1 } = useApi('/bookings?status=awaiting_closure');
  const { data: issues, loading: l2 } = useApi('/bookings?status=issue_reported');

  const rows = [...(awaiting || []), ...(issues || [])].sort((a, b) => a.date.localeCompare(b.date));

  const columns = [
    { key: 'eventName', label: 'Event', render: (b) => <span className="font-medium text-ink-900">{b.eventName}</span> },
    { key: 'bookingRef', label: 'Booking ID' },
    { key: 'floor', label: 'Floor', render: (b) => FLOOR_LABELS[b.floor] },
    { key: 'date', label: 'Date', render: (b) => formatDate(b.date) },
    { key: 'time', label: 'Time', render: (b) => formatTimeRange(b.startTime, b.endTime) },
    {
      key: 'progress',
      label: 'Progress',
      render: (b) =>
        b.status === 'issue_reported' ? (
          <span className="text-xs text-rose-600 font-medium">Issue reported</span>
        ) : b.closure?.submittedAt ? (
          <span className="text-xs text-amber-600 font-medium">Awaiting verification</span>
        ) : (
          <span className="text-xs text-ink-500">Closure required</span>
        ),
    },
    { key: 'status', label: 'Status', render: (b) => <StatusBadge status={b.status} /> },
  ];

  return (
    <>
      <PageHeader
        title="Closure"
        subtitle={user?.role === 'organiser' ? 'Complete closure for your events after they conclude.' : 'Verify closure submissions and manage equipment issues.'}
      />
      <div className="card">
        <DataTable
          columns={columns}
          rows={rows}
          loading={l1 || l2}
          onRowClick={(b) => router.push(`/closure/${b._id}`)}
          emptyTitle="No closures pending"
          emptyDescription="Events awaiting closure or verification will appear here."
        />
      </div>
    </>
  );
}
