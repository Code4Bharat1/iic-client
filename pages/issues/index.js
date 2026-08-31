import { useState } from 'react';
import { useRouter } from 'next/router';
import { useApi } from '@/lib/useApi';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import FilterBar, { SearchInput, Select } from '@/components/ui/FilterBar';
import { ISSUE_TYPE_LABELS, ISSUE_STATUS_STYLES } from '@/lib/constants';

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'open', label: 'Open' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

function IssueStatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${ISSUE_STATUS_STYLES[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

export default function IssuesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (status) params.set('status', status);
  const { data: issues, loading } = useApi(`/issues?${params.toString()}`, [search, status]);

  const columns = [
    { key: 'issueId', label: 'Issue ID', render: (i) => <span className="font-medium text-ink-900">{i.issueId}</span> },
    { key: 'bookingRef', label: 'Booking' },
    { key: 'resourceName', label: 'Resource' },
    { key: 'issueType', label: 'Issue', render: (i) => ISSUE_TYPE_LABELS[i.issueType] },
    { key: 'reportedBy', label: 'Reported By' },
    { key: 'reportedAt', label: 'Date', render: (i) => new Date(i.reportedAt).toLocaleDateString('en-GB') },
    { key: 'status', label: 'Status', render: (i) => <IssueStatusBadge status={i.status} /> },
  ];

  return (
    <>
      <PageHeader title="Issues" subtitle="Equipment issues reported during closure verification." />
      <div className="card p-4 sm:p-5">
        <FilterBar>
          <SearchInput value={search} onChange={setSearch} placeholder="Search issues…" className="w-full sm:w-72" />
          <Select value={status} onChange={setStatus} ariaLabel="Status" options={STATUS_OPTIONS} />
        </FilterBar>
        <DataTable
          columns={columns}
          rows={issues}
          loading={loading}
          onRowClick={(i) => router.push(`/issues/${i._id}`)}
          emptyTitle="No issues reported"
        />
      </div>
    </>
  );
}
