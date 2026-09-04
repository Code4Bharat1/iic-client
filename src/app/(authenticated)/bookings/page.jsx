'use client';
import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useApi } from '@/hooks/useApi';
import { useBookableFloors } from '@/lib/floorOptions';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import FilterBar, { SearchInput, Select } from '@/components/ui/FilterBar';
import { FLOOR_LABELS, STATUS_LABELS, formatDate, formatTimeRange } from '@/lib/constants';

const STATUS_OPTIONS = [
  'pending_approval', 'change_requested', 'confirmed', 'event_in_progress',
  'awaiting_closure', 'issue_reported', 'closed', 'rejected',
];

export default function BookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const floors = useBookableFloors();
  const [search, setSearch] = useState(searchParams?.get('search') || '');
  const [status, setStatus] = useState(searchParams?.get('status') || '');
  const [floor, setFloor] = useState('');

  const path = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (floor) params.set('floor', floor);
    return `/bookings?${params.toString()}`;
  }, [search, status, floor]);

  const { data: bookings, loading } = useApi(path, [path]);

  const columns = [
    { key: 'eventName', label: 'Event', render: (b) => <span className="font-medium text-ink-900">{b.eventName}</span> },
    { key: 'bookingRef', label: 'Booking ID' },
    { key: 'floor', label: 'Floor', render: (b) => FLOOR_LABELS[b.floor] },
    { key: 'date', label: 'Date', render: (b) => formatDate(b.date) },
    { key: 'time', label: 'Time', render: (b) => formatTimeRange(b.startTime, b.endTime) },
    { key: 'status', label: 'Status', render: (b) => <StatusBadge status={b.status} /> },
  ];

  return (
    <>
      <PageHeader title="Bookings" subtitle="Every booking across the institution." actions={<Link href="/bookings/new" className="btn-primary">+ New Booking</Link>} />

      <div className="card p-4 sm:p-5">
        <FilterBar>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by event or reference…" className="w-full sm:w-72" />
          <Select value={status} onChange={setStatus} ariaLabel="Status" options={[{ value: '', label: 'All Status' }, ...STATUS_OPTIONS.map((s) => ({ value: s, label: STATUS_LABELS[s] }))]} />
          <Select value={floor} onChange={setFloor} ariaLabel="Floor" options={[{ value: '', label: 'All Floors' }, ...floors.map((f) => ({ value: f.key, label: f.name }))]} />
        </FilterBar>

        <DataTable
          columns={columns}
          rows={bookings}
          loading={loading}
          onRowClick={(b) => router.push(`/bookings/${b._id}`)}
          emptyTitle="No bookings found"
          emptyDescription="Try adjusting your filters, or create a new booking."
        />
      </div>
    </>
  );
}
