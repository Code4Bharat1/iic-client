import { useState } from 'react';
import { useRouter } from 'next/router';
import { useApi } from '@/lib/useApi';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { FLOOR_LABELS, formatDate, formatTimeRange } from '@/lib/constants';

const TABS = [
  { key: 'pending_approval', label: 'Pending' },
  { key: 'change_requested', label: 'Change Requested' },
  { key: 'confirmed', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

export default function ApprovalsPage() {
  const router = useRouter();
  const [tab, setTab] = useState('pending_approval');
  const { data: bookings, loading } = useApi(`/bookings?status=${tab}`, [tab]);

  const columns = [
    { key: 'eventName', label: 'Event', render: (b) => <span className="font-medium text-ink-900">{b.eventName}</span> },
    { key: 'organiser', label: 'Organiser', render: (b) => b.organiser?.name },
    { key: 'floor', label: 'Floor', render: (b) => FLOOR_LABELS[b.floor] },
    { key: 'date', label: 'Date', render: (b) => formatDate(b.date) },
    { key: 'time', label: 'Time', render: (b) => formatTimeRange(b.startTime, b.endTime) },
    { key: 'attendance', label: 'Attendance', render: (b) => b.expectedAttendance },
    { key: 'submitted', label: 'Submitted', render: (b) => new Date(b.createdAt).toLocaleDateString('en-GB') },
    { key: 'status', label: 'Status', render: (b) => <StatusBadge status={b.status} /> },
  ];

  return (
    <>
      <PageHeader title="Approval Queue" subtitle="Review, approve, or request changes to submitted bookings." />

      <div className="card overflow-hidden">
        <div className="flex border-b border-ink-100 px-2 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px ${
                tab === t.key ? 'border-brand-800 text-brand-800' : 'border-transparent text-ink-500 hover:text-ink-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <DataTable
          columns={columns}
          rows={bookings}
          loading={loading}
          onRowClick={(b) => router.push(`/approvals/${b._id}`)}
          emptyTitle="Nothing here"
          emptyDescription="No bookings in this queue right now."
        />
      </div>
    </>
  );
}
