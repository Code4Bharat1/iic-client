'use client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { FLOOR_LABELS, formatDate, formatTimeRange } from '@/lib/constants';

const CATEGORIES = ['Seating', 'Furniture', 'Electronics', 'Audio', 'Other'];

export default function ResourceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: resource, loading, refetch } = useApi(id ? `/resources/${id}` : null, [id]);
  const floors = useBookableFloors();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [form, setForm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (loading) return <LoadingState rows={8} />;
  if (!resource) return <EmptyState title="Resource not found" />;

  const canManage = user?.role === 'admin' || user?.role === 'master_admin';

  function openEdit() {
    setForm({
      name: resource.name,
      category: resource.category,
      inventoryScope: resource.inventoryScope || (resource.floor === 'all' ? 'shared' : 'floor'),
      floor: resource.floor || 'all',
      unitType: resource.unitType || 'quantity',
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
      await api.put(`/resources/${id}`, {
        ...form,
        floor: form.inventoryScope === 'shared' ? 'all' : form.floor,
        totalQuantity: Number(form.totalQuantity),
      });
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
    try {
      await api.post(`/resources/${id}/status`, {
        active: !resource.active,
        reason: resource.active ? 'Disabled via resource management' : 'Re-enabled via resource management',
      });
      toast(resource.active ? 'Resource disabled.' : 'Resource enabled.', 'success');
      refetch();
    } catch (err) {
      toast(err.message || 'Unable to toggle status.', 'error');
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/resources/${id}`);
      toast('Resource deleted successfully.', 'success');
      router.push('/resources');
    } catch (err) {
      toast(err.message || 'Unable to delete resource.', 'error');
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
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
        subtitle={`${resource.category} · ${resource.inventoryScope === 'shared' || resource.floor === 'all' ? 'Shared (All Floors)' : (FLOOR_LABELS[resource.floor] || resource.floor)}`}
        actions={
          canManage && (
            <div className="flex items-center gap-2">
              <button className="btn-secondary" onClick={openEdit}>Edit Resource</button>
              <button className={resource.active ? 'btn-secondary text-amber-700' : 'btn-primary'} onClick={toggleActive}>
                {resource.active ? 'Disable' : 'Enable'}
              </button>
              <button className="btn-danger text-xs px-2.5 py-1.5" onClick={() => setDeleteOpen(true)}>
                Delete
              </button>
            </div>
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

            <div>
              <label className="field-label">Category</label>
              <select className="field-input" value={form.category} onChange={(e) => update({ category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="field-label">Inventory Scope</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => update({ inventoryScope: 'shared', floor: 'all' })}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    form.inventoryScope === 'shared'
                      ? 'border-brand-600 bg-brand-50/60 ring-1 ring-brand-600'
                      : 'border-ink-200 hover:border-ink-300'
                  }`}
                >
                  <span className="font-medium text-xs text-ink-900 block">Shared (All Floors)</span>
                  <span className="text-[11px] text-ink-500">Available institution-wide across floors</span>
                </button>
                <button
                  type="button"
                  onClick={() => update({ inventoryScope: 'floor', floor: form.floor === 'all' ? (floors[0]?.key || 'ground') : form.floor })}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    form.inventoryScope === 'floor'
                      ? 'border-brand-600 bg-brand-50/60 ring-1 ring-brand-600'
                      : 'border-ink-200 hover:border-ink-300'
                  }`}
                >
                  <span className="font-medium text-xs text-ink-900 block">Floor-Specific</span>
                  <span className="text-[11px] text-ink-500">Restricted to a single floor</span>
                </button>
              </div>
            </div>

            {form.inventoryScope === 'floor' && (
              <div>
                <label className="field-label">Assigned Floor</label>
                <select className="field-input" value={form.floor} onChange={(e) => update({ floor: e.target.value })}>
                  {floors.map((f) => <option key={f.key} value={f.key}>{f.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="field-label">Total Quantity</label>
              <input
                type="number"
                min={0}
                className="field-input"
                value={form.totalQuantity}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === '') {
                    update({ totalQuantity: '' });
                    return;
                  }
                  const val = Math.max(0, parseInt(raw, 10) || 0);
                  update({ totalQuantity: val });
                }}
              />
            </div>
            <div>
              <label className="field-label">Notes</label>
              <textarea className="field-input min-h-[60px]" value={form.notes} onChange={(e) => update({ notes: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Reason for change</label>
              <textarea className="field-input min-h-[60px]" value={form.reason} onChange={(e) => update({ reason: e.target.value })} placeholder="e.g. New inventory received, reassigned to better serve demand" />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title={`Delete "${resource.name}"?`}
        description="Are you sure you want to permanently delete this resource from inventory? This action cannot be undone."
        confirmLabel={deleting ? 'Deleting…' : 'Delete Resource'}
        danger
      />
    </>
  );
}
