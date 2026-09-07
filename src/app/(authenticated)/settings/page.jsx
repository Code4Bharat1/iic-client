'use client';
import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { api } from '@/services/api-client';
import { useToast } from '@/context/ToastContext';
import PageHeader from '@/components/ui/PageHeader';
import LoadingState from '@/components/ui/LoadingState';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

function AddFloorModal({ open, onClose, onCreated }) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [bookable, setBookable] = useState(true);
  const [interactiveTV, setInteractiveTV] = useState(false);
  const [micArrangement, setMicArrangement] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName('');
      setBookable(true);
      setInteractiveTV(false);
      setMicArrangement(false);
    }
  }, [open]);

  async function handleSubmit(e) {
    e?.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/floors', {
        name: name.trim(),
        bookable,
        interactiveTV,
        micArrangement,
      });
      toast(`Floor "${name.trim()}" added successfully.`, 'success');
      onCreated();
      onClose();
    } catch (err) {
      toast(err.message || 'Unable to add floor.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add New Floor"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!name.trim() || submitting}
          >
            {submitting ? 'Adding…' : 'Add Floor'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="field-label">Floor Name</label>
          <input
            className="field-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. 4th Floor, Terrace, Annex"
            autoFocus
          />
          <p className="text-xs text-ink-500 mt-1">
            A unique system key will be automatically created from this name.
          </p>
        </div>

        <div className="rounded-lg border border-ink-200 p-3.5 bg-surface/50 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ink-900">Make Bookable</p>
              <p className="text-xs text-ink-500">Allow organisers to book events on this floor</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={bookable}
              onClick={() => setBookable(!bookable)}
              className="flex items-center gap-2 cursor-pointer focus:outline-none select-none"
            >
              <span
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                  bookable ? 'bg-emerald-600' : 'bg-ink-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                    bookable ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </span>
            </button>
          </div>

          <div className="border-t border-ink-200/60 pt-3 space-y-2">
            <p className="text-xs font-medium text-ink-700">Floor Amenities & Features</p>
            <label className="flex items-center gap-2 text-xs text-ink-700 cursor-pointer">
              <input
                type="checkbox"
                checked={interactiveTV}
                onChange={(e) => setInteractiveTV(e.target.checked)}
                className="rounded border-ink-300 text-brand-800 focus:ring-brand-600 h-4 w-4 cursor-pointer"
              />
              Interactive TV Available
            </label>
            <label className="flex items-center gap-2 text-xs text-ink-700 cursor-pointer">
              <input
                type="checkbox"
                checked={micArrangement}
                onChange={(e) => setMicArrangement(e.target.checked)}
                className="rounded border-ink-300 text-brand-800 focus:ring-brand-600 h-4 w-4 cursor-pointer"
              />
              Mic Arrangement Available
            </label>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export default function SettingsPage() {
  const { toast } = useToast();
  const { data: settings, loading, refetch } = useApi('/settings');
  const { data: floors, refetch: refetchFloors } = useApi('/floors');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [addFloorOpen, setAddFloorOpen] = useState(false);
  const [floorToDelete, setFloorToDelete] = useState(null);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  async function saveGeneral() {
    setSaving(true);
    try {
      await api.put('/settings', { bookingWindowMonths: Number(form.bookingWindowMonths), orgName: form.orgName, notifyOnApproval: form.notifyOnApproval, notifyOnClosure: form.notifyOnClosure });
      toast('Settings updated.', 'success');
      refetch();
    } catch (err) {
      toast(err.message || 'Unable to update settings.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function toggleFloor(floor, field) {
    try {
      await api.put(`/floors/${floor._id}`, { [field]: !floor[field] });
      toast('Floor configuration updated.', 'success');
      refetchFloors();
    } catch (err) {
      toast(err.message || 'Unable to update floor.', 'error');
    }
  }

  async function handleConfirmDeleteFloor() {
    if (!floorToDelete) return;
    try {
      await api.delete(`/floors/${floorToDelete._id}`);
      toast(`Floor "${floorToDelete.name}" deleted.`, 'success');
      setFloorToDelete(null);
      refetchFloors();
    } catch (err) {
      toast(err.message || 'Unable to delete floor.', 'error');
    }
  }

  if (loading || !form) return <LoadingState rows={10} />;

  return (
    <>
      <PageHeader title="Settings" subtitle="System-wide configuration for Master Admin." />

      <AddFloorModal
        open={addFloorOpen}
        onClose={() => setAddFloorOpen(false)}
        onCreated={refetchFloors}
      />

      <ConfirmDialog
        open={!!floorToDelete}
        onClose={() => setFloorToDelete(null)}
        onConfirm={handleConfirmDeleteFloor}
        title={`Delete "${floorToDelete?.name}"?`}
        description="Are you sure you want to permanently delete this floor from the venue system? This action cannot be undone."
        confirmLabel="Delete Floor"
        tone="danger"
      />

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-ink-900 mb-4">General</h2>
          <div className="space-y-4">
            <div>
              <label className="field-label">Organisation Name</label>
              <input className="field-input" value={form.orgName} onChange={(e) => setForm((f) => ({ ...f, orgName: e.target.value }))} />
            </div>
            <div>
              <label className="field-label">Booking Window (months, including current)</label>
              <input type="number" min={1} max={6} className="field-input max-w-[140px]" value={form.bookingWindowMonths} onChange={(e) => setForm((f) => ({ ...f, bookingWindowMonths: e.target.value }))} />
              <p className="text-xs text-ink-500 mt-1.5">Currently: current calendar month + {Number(form.bookingWindowMonths) - 1} following month(s).</p>
            </div>
            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input type="checkbox" checked={form.notifyOnApproval} onChange={(e) => setForm((f) => ({ ...f, notifyOnApproval: e.target.checked }))} />
              Notify organisers when a booking is approved
            </label>
            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input type="checkbox" checked={form.notifyOnClosure} onChange={(e) => setForm((f) => ({ ...f, notifyOnClosure: e.target.checked }))} />
              Notify admins when closure is submitted
            </label>
            <button className="btn-primary" onClick={saveGeneral} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-ink-900">Floors</h2>
              <p className="text-xs text-ink-500">Configure bookability and floor amenities</p>
            </div>
            <button
              type="button"
              onClick={() => setAddFloorOpen(true)}
              className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>Add Floor</span>
            </button>
          </div>
          <div className="space-y-3">
            {(floors || []).map((f) => (
              <div
                key={f._id}
                className={`rounded-lg border px-4 py-3 transition-colors ${
                  f.bookable ? 'border-ink-200 bg-white' : 'border-ink-200/60 bg-ink-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-sm font-medium text-ink-900">{f.name}</p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={f.bookable}
                      onClick={() => toggleFloor(f, 'bookable')}
                      className="flex items-center gap-2 cursor-pointer focus:outline-none select-none group"
                      title={f.bookable ? 'Click to set Not Bookable' : 'Click to set Bookable'}
                    >
                      <span
                        className={`text-xs font-semibold tracking-wide transition-colors ${
                          f.bookable ? 'text-emerald-700' : 'text-ink-400'
                        }`}
                      >
                        {f.bookable ? 'Bookable' : 'Not Bookable'}
                      </span>
                      <span
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                          f.bookable ? 'bg-emerald-600' : 'bg-ink-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            f.bookable ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFloorToDelete(f)}
                      title={`Delete ${f.name}`}
                      className="text-ink-400 hover:text-red-600 p-1 rounded transition-colors"
                      aria-label={`Delete ${f.name}`}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className={`flex gap-4 text-xs transition-opacity ${f.bookable ? 'text-ink-600' : 'text-ink-400 opacity-60'}`}>
                  <label className={`flex items-center gap-1.5 ${f.bookable ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                    <input
                      type="checkbox"
                      checked={f.interactiveTV}
                      disabled={!f.bookable}
                      onChange={() => toggleFloor(f, 'interactiveTV')}
                    />
                    Interactive TV
                  </label>
                  <label className={`flex items-center gap-1.5 ${f.bookable ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                    <input
                      type="checkbox"
                      checked={f.micArrangement}
                      disabled={!f.bookable}
                      onChange={() => toggleFloor(f, 'micArrangement')}
                    />
                    Mic Arrangement
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
