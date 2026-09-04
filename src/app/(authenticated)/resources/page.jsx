'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { api } from '@/services/api-client';
import { useToast } from '@/context/ToastContext';
import { useBookableFloors } from '@/lib/floorOptions';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import StatCard from '@/components/ui/StatCard';
import FilterBar, { SearchInput, Select } from '@/components/ui/FilterBar';
import Modal from '@/components/ui/Modal';
import { FLOOR_LABELS } from '@/lib/constants';

const CATEGORIES = ['Seating', 'Furniture', 'Electronics', 'Audio', 'Other'];

function AddResourceModal({ open, onClose, floors, onCreated }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', category: 'Furniture', floor: floors[0]?.key || '', unitType: 'quantity', totalQuantity: 1, notes: '' });
  const [submitting, setSubmitting] = useState(false);

  function update(patch) {
    setForm((f) => ({ ...f, ...patch }));
  }

  async function submit() {
    if (!form.name) return;
    setSubmitting(true);
    try {
      await api.post('/resources', { ...form, totalQuantity: Number(form.totalQuantity) });
      toast('Resource created.', 'success');
      onCreated();
      onClose();
    } catch (err) {
      toast(err.message || 'Unable to create resource.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Resource"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={!form.name || submitting}>{submitting ? 'Saving…' : 'Add Resource'}</button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="field-label">Resource Name</label>
          <input className="field-input" value={form.name} onChange={(e) => update({ name: e.target.value })} placeholder="e.g. Projector" />
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
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Unit Type</label>
            <select className="field-input" value={form.unitType} onChange={(e) => update({ unitType: e.target.value, totalQuantity: e.target.value === 'toggle' ? 1 : form.totalQuantity })}>
              <option value="quantity">Quantity-based</option>
              <option value="toggle">Single unit (toggle)</option>
            </select>
          </div>
          <div>
            <label className="field-label">Total Quantity</label>
            <input type="number" min={1} disabled={form.unitType === 'toggle'} className="field-input" value={form.totalQuantity} onChange={(e) => update({ totalQuantity: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="field-label">Notes</label>
          <textarea className="field-input min-h-[60px]" value={form.notes} onChange={(e) => update({ notes: e.target.value })} />
        </div>
      </div>
    </Modal>
  );
}

export default function ResourcesPage() {
  const router = useRouter();
  const floors = useBookableFloors();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [floor, setFloor] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category) params.set('category', category);
  if (floor) params.set('floor', floor);
  const { data: resources, loading, refetch } = useApi(`/resources?${params.toString()}`, [search, category, floor]);

  const total = resources?.length || 0;
  const active = resources?.filter((r) => r.active).length || 0;
  const inactive = total - active;

  const columns = [
    { key: 'name', label: 'Resource', render: (r) => <span className="font-medium text-ink-900">{r.name}</span> },
    { key: 'category', label: 'Category' },
    { key: 'floor', label: 'Floor', render: (r) => FLOOR_LABELS[r.floor] },
    { key: 'totalQuantity', label: 'Total', render: (r) => (r.unitType === 'toggle' ? '1 unit' : r.totalQuantity) },
    { key: 'reservedToday', label: 'Reserved (Today)', render: (r) => (r.unitType === 'toggle' ? (r.reservedToday > 0 ? 'In use' : '—') : r.reservedToday) },
    { key: 'availableToday', label: 'Available (Today)', render: (r) => (r.unitType === 'toggle' ? (r.availableToday > 0 ? 'Free' : 'In use') : r.availableToday) },
    { key: 'status', label: 'Status', render: (r) => (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${r.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-ink-100 text-ink-500 border-ink-200'}`}>
        {r.active ? 'Active' : 'Inactive'}
      </span>
    ) },
    { key: 'updatedAt', label: 'Last Updated', render: (r) => new Date(r.updatedAt).toLocaleDateString('en-GB') },
  ];

  return (
    <>
      <PageHeader title="Resource Management" subtitle="Configure institutional inventory available for booking." actions={<button className="btn-primary" onClick={() => setAddOpen(true)}>+ Add Resource</button>} />

      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5">
        <StatCard label="Total Resources" value={total} />
        <StatCard label="Active" value={active} tone="success" />
        <StatCard label="Inactive" value={inactive} />
      </div>

      <div className="card p-4 sm:p-5">
        <FilterBar>
          <SearchInput value={search} onChange={setSearch} placeholder="Search resources…" className="w-full sm:w-64" />
          <Select value={category} onChange={setCategory} ariaLabel="Category" options={[{ value: '', label: 'All Categories' }, ...CATEGORIES.map((c) => ({ value: c, label: c }))]} />
          <Select value={floor} onChange={setFloor} ariaLabel="Floor" options={[{ value: '', label: 'All Floors' }, ...floors.map((f) => ({ value: f.key, label: f.name }))]} />
        </FilterBar>
        <DataTable columns={columns} rows={resources} loading={loading} onRowClick={(r) => router.push(`/resources/${r._id}`)} emptyTitle="No resources found" />
      </div>

      <AddResourceModal open={addOpen} onClose={() => setAddOpen(false)} floors={floors} onCreated={refetch} />
    </>
  );
}
