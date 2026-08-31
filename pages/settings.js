import { useEffect, useState } from 'react';
import { useApi } from '@/lib/useApi';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import PageHeader from '@/components/ui/PageHeader';
import LoadingState from '@/components/ui/LoadingState';

export default function SettingsPage() {
  const { toast } = useToast();
  const { data: settings, loading, refetch } = useApi('/settings');
  const { data: floors, refetch: refetchFloors } = useApi('/floors');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

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
    await api.put(`/floors/${floor._id}`, { [field]: !floor[field] });
    toast('Floor configuration updated.', 'success');
    refetchFloors();
  }

  if (loading || !form) return <LoadingState rows={10} />;

  return (
    <>
      <PageHeader title="Settings" subtitle="System-wide configuration for Master Admin." />

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
          <h2 className="text-sm font-semibold text-ink-900 mb-4">Floors</h2>
          <div className="space-y-3">
            {(floors || []).map((f) => (
              <div key={f._id} className="rounded-md border border-ink-200 px-3.5 py-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-ink-900">{f.name}</p>
                  <button
                    onClick={() => toggleFloor(f, 'bookable')}
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border ${f.bookable ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-ink-100 text-ink-500 border-ink-200'}`}
                  >
                    {f.bookable ? 'Bookable' : 'Not Bookable'}
                  </button>
                </div>
                <div className="flex gap-4 text-xs text-ink-500">
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" checked={f.interactiveTV} disabled={!f.bookable} onChange={() => toggleFloor(f, 'interactiveTV')} />
                    Interactive TV
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" checked={f.micArrangement} disabled={!f.bookable} onChange={() => toggleFloor(f, 'micArrangement')} />
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
