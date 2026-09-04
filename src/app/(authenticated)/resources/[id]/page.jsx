'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useApi } from '@/hooks/useApi';
import { api } from '@/services/api-client';
import { useBookableFloors } from '@/lib/floorOptions';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingState from '@/components/ui/LoadingState';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import { FLOOR_LABELS, formatDate, formatTimeRange } from '@/lib/constants';

const CATEGORIES = ['Seating', 'Furniture', 'Electronics', 'Audio', 'Other'];

export default function ResourceDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: resource, loading, refetch } = useApi(id ? `/resources/${id}` : null, [id]);
  const floors = useBookableFloors();
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <LoadingState rows={8} />;
  if (!resource) return <EmptyState title="Resource not found" />;

  const canManage = user.role === 'admin' || user.role === 'master_admin';

  function openEdit() {
    setForm({
      name: resource.name,
      category: resource.category,
      floor: resource.floor,
      totalQuantity: resource.totalQuantity,
      notes: resource.notes || '',
      reason: '',
    });
    setEditOpen(true);
  }

  function update(patch) {
    setForm((f) => ({ ...f, ...patch }));
  }

  async function saveResource() {
    setSubmitting(true);
    try {
      await api.put(`/resources/${id}`, { ...form, totalQuantity: Number(form.totalQuantity) });
      toast('Resource updated.', 'success');
      setEditOpen(false);
      refetch();
    } catch (err) {
      toast(err.message || 'Unable to update resource.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive() {
    await api.post(`/resources/${id}/status`, { active: !resource.active, reason: resource.active ? 'Disabled via resource management' : 'Re-enabled via resource management' });
    toast(resource.active ? 'Resource disabled.' : 'Resource enabled.', 'success');
    refetch();
  }

  const allocationColumns = [
    { key: 'event', label: 'Event' },
    { key: 'bookingRef', label: 'Booking ID' },
    { key: 'date', label: 'Date', render: (a) => formatDate(a.date) },
    { key: 'time', label: 'Time' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'status', label: 'Status', render: (a) => <StatusBadge status={a.status} /> },
  ];

  return (
    <>
      <PageHeader
        title={resource.name}
        subtitle={`${resource.category} · ${FLOOR_LABELS[resource.floor]}`}
        actions={
          canManage && (
            <>
              <button className="btn-secondary" onClick={openEdit}>Edit Resource</button>
              <button className={resource.active ? 'btn-danger' : 'btn-primary'} onClick={toggleActive}>
                {resource.active ? 'Disable' : 'Enable'}
              </button>
            </>
          )
        }
      />

      <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 mb-5">
        <div className="card p-4">
          <p className="text-sm text-ink-500">Total Quantity</p>
          <p className="text-2xl font-semibold text-ink-900 mt-1">{resource.unitType === 'toggle' ? '1 unit' : resource.totalQuantity}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-ink-500">Status</p>
          <p className="text-2xl font-semibold mt-1">
            <span className={resource.active ? 'text-emerald-600' : 'text-ink-500'}>{resource.active ? 'Active' : 'Inactive'}</span>
          </p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-ink-500">Bookings Using</p>
          <p className="text-2xl font-semibold text-ink-900 mt-1">{resource.allocations?.length || 0}</p>
        </div>
      </div>

      <div className="card mb-5">
        <div className="px-4 sm:px-5 py-3.5 border-b border-ink-100">
          <h2 className="text-sm font-semibold text-ink-900">Booking Allocations</h2>
        </div>
        <DataTable columns={allocationColumns} rows={resource.allocations} emptyTitle="No bookings have used this resource yet" />
      </div>

      <div className="card p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-ink-900 mb-3">Inventory History</h2>
        <div className="space-y-3">
          {(resource.history || []).slice().reverse().map((h, i) => (
            <div key={i} className="text-sm border-b border-ink-50 last:border-0 pb-2.5">
              <div className="flex justify-between">
                <span className="font-medium text-ink-800">{h.action}</span>
                <span className="text-ink-400 text-xs">{new Date(h.timestamp).toLocaleString()}</span>
              </div>
              <p className="text-xs text-ink-500 mt-0.5">
                {h.oldQuantity !== undefined && h.newQuantity !== undefined && `${h.oldQuantity} → ${h.newQuantity} · `}
                {h.changedBy} {h.reason && `· ${h.reason}`}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Resource"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setEditOpen(false)}>Cancel</button>
            <button className="btn-primary" onClick={saveResource} disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</button>
          </>
        }
      >
        {form && (
          <div className="space-y-4">
            <div>
              <label className="field-label">Resource Name</label>
              <input className="field-input" value={form.name} onChange={(e) => update({ name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label">Category</label>
                <select className="field-input" value={form.category} onChange={(e) => update({ category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="field-label">Floor</label>
                <select className="field-input" value={form.floor} onChange={(e) => update({ floor: e.target.value })}>
                  {floors.map((f) => <option key={f.key} value={f.key}>{f.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="field-label">Total Quantity</label>
              <input
                type="number"
                min={0}
                disabled={resource.unitType === 'toggle'}
                className="field-input"
                value={form.totalQuantity}
                onChange={(e) => update({ totalQuantity: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Notes</label>
              <textarea className="field-input min-h-[60px]" value={form.notes} onChange={(e) => update({ notes: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Reason for change</label>
              <textarea className="field-input min-h-[60px]" value={form.reason} onChange={(e) => update({ reason: e.target.value })} placeholder="e.g. New inventory received, reassigned to better serve 2nd Floor demand" />
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
