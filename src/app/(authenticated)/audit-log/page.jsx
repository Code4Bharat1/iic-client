'use client';
import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import Drawer from '@/components/ui/Drawer';
import { SearchInput } from '@/components/ui/FilterBar';

export default function AuditLogPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const { data: logs, loading } = useApi(`/audit-log?search=${encodeURIComponent(search)}`, [search]);

  const columns = [
    { key: 'timestamp', label: 'Timestamp', render: (l) => new Date(l.timestamp).toLocaleString() },
    { key: 'userName', label: 'User' },
    { key: 'action', label: 'Action', render: (l) => <span className="font-medium text-ink-900">{l.action}</span> },
    { key: 'entity', label: 'Entity' },
    { key: 'entityLabel', label: 'Entity ID', render: (l) => l.entityLabel || l.entityId },
    { key: 'reason', label: 'Reason', render: (l) => l.reason || '—' },
  ];

  return (
    <>
      <PageHeader title="Audit Log" subtitle="A complete, tamper-evident record of state-changing actions." />
      <div className="card p-4 sm:p-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by user, action or entity…" className="w-full sm:w-80 mb-4" />
        <DataTable columns={columns} rows={logs} loading={loading} onRowClick={setSelected} emptyTitle="No audit activity yet" />
      </div>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title="Audit Entry">
        {selected && (
          <dl className="space-y-3 text-sm">
            <div><dt className="text-ink-500">Timestamp</dt><dd className="font-medium text-ink-900">{new Date(selected.timestamp).toLocaleString()}</dd></div>
            <div><dt className="text-ink-500">User</dt><dd className="font-medium text-ink-900">{selected.userName} ({selected.userId})</dd></div>
            <div><dt className="text-ink-500">Action</dt><dd className="font-medium text-ink-900">{selected.action}</dd></div>
            <div><dt className="text-ink-500">Entity</dt><dd className="font-medium text-ink-900">{selected.entity} · {selected.entityLabel || selected.entityId}</dd></div>
            {selected.oldValue && <div><dt className="text-ink-500">Old Value</dt><dd className="font-medium text-ink-900 break-words">{selected.oldValue}</dd></div>}
            {selected.newValue && <div><dt className="text-ink-500">New Value</dt><dd className="font-medium text-ink-900 break-words">{selected.newValue}</dd></div>}
            {selected.reason && <div><dt className="text-ink-500">Reason</dt><dd className="font-medium text-ink-900">{selected.reason}</dd></div>}
          </dl>
        )}
      </Drawer>
    </>
  );
}
