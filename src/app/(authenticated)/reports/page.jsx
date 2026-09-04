'use client';
import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { useToast } from '@/context/ToastContext';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import UtilisationBar from '@/components/ui/UtilisationBar';
import { FLOOR_LABELS, formatDate, formatTimeRange } from '@/lib/constants';

const REPORT_TYPES = [
  { key: 'bookings', label: 'Booking Report' },
  { key: 'floor-utilisation', label: 'Floor Utilisation' },
  { key: 'resource-utilisation', label: 'Resource Utilisation' },
  { key: 'issues', label: 'Equipment Issues' },
  { key: 'pending-closures', label: 'Pending Closures' },
  { key: 'cancellations', label: 'Cancellation / Rejection' },
  { key: 'history', label: 'Complete Booking History' },
];

const COLUMNS = {
  bookings: [
    { key: 'eventName', label: 'Event' },
    { key: 'bookingRef', label: 'Booking ID' },
    { key: 'floor', label: 'Floor', render: (b) => FLOOR_LABELS[b.floor] },
    { key: 'date', label: 'Date', render: (b) => formatDate(b.date) },
    { key: 'organiser', label: 'Organiser', render: (b) => b.organiser?.name },
    { key: 'status', label: 'Status', render: (b) => <StatusBadge status={b.status} /> },
  ],
  'floor-utilisation': [
    { key: 'name', label: 'Floor' },
    { key: 'bookings', label: 'Bookings' },
    { key: 'avgUtilisation', label: 'Avg. Utilisation (%)' },
  ],
  'resource-utilisation': [
    { key: 'name', label: 'Resource' },
    { key: 'floor', label: 'Floor', render: (r) => FLOOR_LABELS[r.floor] },
    { key: 'totalQuantity', label: 'Total' },
    { key: 'bookingsUsing', label: 'Bookings Using' },
    { key: 'totalRequested', label: 'Total Requested' },
  ],
  issues: [
    { key: 'issueId', label: 'Issue ID' },
    { key: 'bookingRef', label: 'Booking' },
    { key: 'resourceName', label: 'Resource' },
    { key: 'issueType', label: 'Type' },
    { key: 'status', label: 'Status' },
  ],
  'pending-closures': [
    { key: 'eventName', label: 'Event' },
    { key: 'bookingRef', label: 'Booking ID' },
    { key: 'floor', label: 'Floor', render: (b) => FLOOR_LABELS[b.floor] },
    { key: 'date', label: 'Date', render: (b) => formatDate(b.date) },
    { key: 'status', label: 'Status', render: (b) => <StatusBadge status={b.status} /> },
  ],
  cancellations: [
    { key: 'eventName', label: 'Event' },
    { key: 'bookingRef', label: 'Booking ID' },
    { key: 'floor', label: 'Floor', render: (b) => FLOOR_LABELS[b.floor] },
    { key: 'date', label: 'Date', render: (b) => formatDate(b.date) },
    { key: 'rejectionReason', label: 'Reason' },
  ],
  history: [
    { key: 'eventName', label: 'Event' },
    { key: 'bookingRef', label: 'Booking ID' },
    { key: 'floor', label: 'Floor', render: (b) => FLOOR_LABELS[b.floor] },
    { key: 'date', label: 'Date', render: (b) => formatDate(b.date) },
    { key: 'time', label: 'Time', render: (b) => formatTimeRange(b.startTime, b.endTime) },
    { key: 'status', label: 'Status', render: (b) => <StatusBadge status={b.status} /> },
  ],
};

export default function ReportsPage() {
  const { toast } = useToast();
  const [type, setType] = useState('bookings');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const { data, loading } = useApi(`/reports/${type}?${params.toString()}`, [type, from, to]);

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Operational reporting across bookings, floors, resources and issues."
        actions={<button className="btn-secondary" onClick={() => toast('Report generated successfully.', 'success')}>Export</button>}
      />

      <div className="card p-4 sm:p-5">
        <div className="flex flex-wrap gap-2 border-b border-ink-100 pb-4 mb-4">
          {REPORT_TYPES.map((r) => (
            <button
              key={r.key}
              onClick={() => setType(r.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${type === r.key ? 'bg-brand-800 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-end gap-3 mb-5">
          <div>
            <label className="field-label">From</label>
            <input type="date" className="field-input" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="field-label">To</label>
            <input type="date" className="field-input" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>

        {type === 'floor-utilisation' && data?.rows && (
          <div className="grid sm:grid-cols-3 gap-4 mb-5">
            {data.rows.map((r) => (
              <UtilisationBar key={r.floor} label={r.name} percent={r.avgUtilisation} sublabel={`${r.bookings} bookings`} />
            ))}
          </div>
        )}

        <DataTable columns={COLUMNS[type]} rows={data?.rows} loading={loading} emptyTitle="No data for this report" />
      </div>
    </>
  );
}
