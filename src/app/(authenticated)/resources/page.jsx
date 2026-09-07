'use client';
import { useState, useEffect } from 'react';
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
import FloorMultiSelect from '@/components/ui/FloorMultiSelect';
import { FLOOR_LABELS } from '@/lib/constants';

const CATEGORIES = ['Seating', 'Furniture', 'Electronics', 'Audio', 'Other'];

function AddResourceModal({ open, onClose, floors, onCreated }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', category: 'Furniture', unitType: 'quantity', totalQuantity: 0, notes: '', inventoryScope: 'shared' });
  const [selectedFloors, setSelectedFloors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ name: '', category: 'Furniture', unitType: 'quantity', totalQuantity: 0, notes: '', inventoryScope: 'shared' });
      setSelectedFloors(floors[0]?.key ? [floors[0].key] : []);
    }
  }, [open, floors]);

  function update(patch) {
    setForm((f) => ({ ...f, ...patch }));
  }

  async function submit() {
    if (!form.name.trim()) return;
    if (form.inventoryScope === 'floor' && selectedFloors.length === 0) return;
    setSubmitting(true);
    try {
      if (form.inventoryScope === 'shared') {
        await api.post('/resources', {
          ...form,
          floors: [],
          totalQuantity: Number(form.totalQuantity) || 0,
        });
        toast('Shared resource created successfully.', 'success');
      } else {
        await api.post('/resources', {
          ...form,
          floors: selectedFloors,
          totalQuantity: Number(form.totalQuantity) || 0,
        });
        toast(
          selectedFloors.length > 1
            ? `Resource created, pooled across ${selectedFloors.length} floors.`
            : 'Resource created.',
          'success'
        );
      }
      onCreated();
      onClose();
    } catch (err) {
      toast(err.message || 'Unable to create resource.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const isFormValid = form.name.trim() && (form.inventoryScope === 'shared' || selectedFloors.length > 0);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Resource"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={submit}
            disabled={!isFormValid || submitting}
          >
            {submitting ? 'Saving…' : 'Add Resource'}
          </button>
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
        </div>

        <div>
          <label className="field-label">Inventory Scope</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              type="button"
              onClick={() => update({ inventoryScope: 'shared' })}
              className={`p-3 rounded-lg border text-left transition-all ${
                form.inventoryScope === 'shared'
                  ? 'border-brand-600 bg-brand-50/60 ring-1 ring-brand-600'
                  : 'border-ink-200 hover:border-ink-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="inventoryScope"
                  checked={form.inventoryScope === 'shared'}
                  onChange={() => update({ inventoryScope: 'shared' })}
                  className="text-brand-700"
                />
                <span className="font-semibold text-xs text-ink-900">Shared (All Floors)</span>
              </div>
              <p className="text-[11px] text-ink-500 mt-1 pl-5">
                One shared institutional pool across all floors (e.g. Phones, Projectors, Microphones).
              </p>
            </button>

            <button
              type="button"
              onClick={() => update({ inventoryScope: 'floor' })}
              className={`p-3 rounded-lg border text-left transition-all ${
                form.inventoryScope === 'floor'
                  ? 'border-brand-600 bg-brand-50/60 ring-1 ring-brand-600'
                  : 'border-ink-200 hover:border-ink-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="inventoryScope"
                  checked={form.inventoryScope === 'floor'}
                  onChange={() => update({ inventoryScope: 'floor' })}
                  className="text-brand-700"
                />
                <span className="font-semibold text-xs text-ink-900">Floor-Specific</span>
              </div>
              <p className="text-[11px] text-ink-500 mt-1 pl-5">
                Fixed or dedicated to specific floor(s) only (e.g. built-in podiums or fixed sets).
              </p>
            </button>
          </div>
        </div>

        {form.inventoryScope === 'floor' ? (
          <div>
            <FloorMultiSelect floors={floors} selected={selectedFloors} onChange={setSelectedFloors} />
            {selectedFloors.length > 1 && (
              <p className="text-[11px] text-ink-500 mt-1.5">
                The total quantity is one shared pool across the selected floors — a reservation on one of them deducts from what&apos;s available on the others during overlapping time slots.
              </p>
            )}
          </div>
        ) : (
          <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 text-xs text-sky-900">
            <div className="flex items-center gap-1.5 font-semibold">
              <svg className="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Central Shared Inventory Pool
            </div>
            <p className="mt-1 text-sky-700">
              This resource will be pooled centrally across all floors. Organizers on any floor can book from these units, and reservations on one floor will deduct from the shared availability on other floors during overlapping time slots.
            </p>
          </div>
        )}

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
    {
      key: 'floor',
      label: 'Floor / Scope',
      render: (r) =>
        r.inventoryScope === 'shared' ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-800 border border-sky-200">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
            Shared (All Floors)
          </span>
        ) : (
          (r.floors || []).map((f) => FLOOR_LABELS[f] || f).join(', ')
        ),
    },
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
