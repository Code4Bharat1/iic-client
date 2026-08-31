import { useRouter } from 'next/router';
import { useApi } from '@/lib/useApi';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { FLOOR_LABELS, formatDate, formatTimeRange } from '@/lib/constants';
import { todayDateStr } from '@/lib/dateUtils';

export default function EventsPage() {
  const router = useRouter();
  const { data: bookings, loading } = useApi('/bookings');

  const today = todayDateStr();
  const eventDay = (bookings || [])
    .filter((b) => ['confirmed', 'event_in_progress', 'awaiting_closure', 'issue_reported'].includes(b.status) && b.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  const columns = [
    { key: 'eventName', label: 'Event', render: (b) => <span className="font-medium text-ink-900">{b.eventName}</span> },
    { key: 'floor', label: 'Floor', render: (b) => FLOOR_LABELS[b.floor] },
    { key: 'date', label: 'Date', render: (b) => formatDate(b.date) },
    { key: 'time', label: 'Time', render: (b) => formatTimeRange(b.startTime, b.endTime) },
    { key: 'status', label: 'Status', render: (b) => <StatusBadge status={b.status} /> },
  ];

  return (
    <>
      <PageHeader title="Events" subtitle="Confirmed and in-progress events with operational details." />
      <div className="card">
        <DataTable
          columns={columns}
          rows={eventDay}
          loading={loading}
          onRowClick={(b) => router.push(`/events/${b._id}`)}
          emptyTitle="No upcoming events"
          emptyDescription="Confirmed bookings will appear here as their event day approaches."
        />
      </div>
    </>
  );
}
