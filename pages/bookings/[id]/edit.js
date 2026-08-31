import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useApi } from '@/lib/useApi';
import { api, ApiError } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useBookableFloors } from '@/lib/floorOptions';
import PageHeader from '@/components/ui/PageHeader';
import LoadingState from '@/components/ui/LoadingState';
import ResourceQuantityInput from '@/components/ui/ResourceQuantityInput';

export default function EditBookingPage() {
  const router = useRouter();
  const { id } = router.query;
  const { toast } = useToast();
  const floors = useBookableFloors();
  const { data: booking, loading } = useApi(id ? `/bookings/${id}` : null, [id]);

  const [form, setForm] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [issue, setIssue] = useState(null);

  useEffect(() => {
    if (!booking) return;
    const resources = {};
    booking.resources.forEach((r) => {
      resources[r.resource] = r.quantity;
    });
    setForm({
      eventName: booking.eventName,
      purpose: booking.purpose,
      expectedAttendance: booking.expectedAttendance,
      organiser: booking.organiser,
      floor: booking.floor,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      resources,
      specialRequirements: booking.specialRequirements || '',
    });
  }, [booking]);

  useEffect(() => {
    if (!form) return;
    api.get(`/availability/check?floor=${form.floor}&date=${form.date}&start=${form.startTime}&end=${form.endTime}`).then(setAvailability);
    api.get(`/resources/catalog?floor=${form.floor}&date=${form.date}&start=${form.startTime}&end=${form.endTime}`).then(setCatalog);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form?.floor, form?.date, form?.startTime, form?.endTime]);

  if (loading || !form) return <LoadingState rows={8} />;

  function update(patch) {
    setForm((f) => ({ ...f, ...patch }));
  }
  function setResourceQty(resourceId, qty) {
    setForm((f) => ({ ...f, resources: { ...f.resources, [resourceId]: qty } }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setIssue(null);
    try {
      await api.put(`/bookings/${id}`, {
        ...form,
        expectedAttendance: Number(form.expectedAttendance),
        resources: Object.entries(form.resources)
          .filter(([, qty]) => qty > 0)
          .map(([resourceId, quantity]) => ({ resourceId, quantity })),
      });
      toast('Booking resubmitted for approval.', 'success');
      router.push(`/bookings/${id}`);
    } catch (err) {
      if (err instanceof ApiError && err.payload) {
        setIssue(err.payload);
      } else {
        toast(err.message || 'Unable to resubmit booking.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader title="Edit & Resubmit" subtitle={booking.bookingRef} />

      {booking.adminComment && (
        <div className="rounded-md border border-violet-200 bg-violet-50 px-4 py-3 mb-5 text-sm text-violet-800">
          <p className="font-medium mb-0.5">Admin requested changes</p>
          {booking.adminComment}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-4 sm:p-6 max-w-3xl space-y-5">
        <div>
          <label className="field-label">Event Name</label>
          <input className="field-input" value={form.eventName} onChange={(e) => update({ eventName: e.target.value })} required />
        </div>
        <div>
          <label className="field-label">Purpose</label>
          <textarea className="field-input min-h-[80px]" value={form.purpose} onChange={(e) => update({ purpose: e.target.value })} required />
        </div>
        <div>
          <label className="field-label">Expected Attendance</label>
          <input type="number" min={1} className="field-input max-w-[180px]" value={form.expectedAttendance} onChange={(e) => update({ expectedAttendance: e.target.value })} required />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Floor</label>
            <select className="field-input" value={form.floor} onChange={(e) => update({ floor: e.target.value })}>
              {floors.map((f) => (
                <option key={f.key} value={f.key}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Date</label>
            <input type="date" className="field-input" value={form.date} onChange={(e) => update({ date: e.target.value })} required />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Start Time</label>
            <input type="time" className="field-input" value={form.startTime} onChange={(e) => update({ startTime: e.target.value })} required />
          </div>
          <div>
            <label className="field-label">End Time</label>
            <input type="time" className="field-input" value={form.endTime} onChange={(e) => update({ endTime: e.target.value })} required />
          </div>
        </div>

        {availability && (
          <div className={`rounded-lg border p-3.5 text-sm ${availability.available ? 'border-emerald-200 bg-emerald-50/60 text-emerald-700' : 'border-red-200 bg-red-50/60 text-red-700'}`}>
            {availability.available ? 'AVAILABLE' : `CONFLICT: reserved ${availability.conflicts[0]?.startTime}–${availability.conflicts[0]?.endTime}`}
          </div>
        )}

        {catalog.length > 0 && (
          <div>
            <label className="field-label">Resources</label>
            <div className="grid sm:grid-cols-2 gap-3">
              {catalog.map((r) => (
                <ResourceQuantityInput
                  key={r.resourceId}
                  resource={r}
                  quantity={form.resources[r.resourceId] || 0}
                  onChange={(qty) => setResourceQty(r.resourceId, qty)}
                  error={(form.resources[r.resourceId] || 0) > r.available}
                />
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="field-label">Special Arrangements</label>
          <textarea className="field-input min-h-[70px]" value={form.specialRequirements} onChange={(e) => update({ specialRequirements: e.target.value })} />
        </div>

        {issue && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
            <p className="font-medium">{issue.message || issue.error || 'Unable to resubmit.'}</p>
            {issue.errors?.map((e, i) => <p key={i}>{e.message}</p>)}
          </div>
        )}

        <div className="flex justify-end gap-2.5 pt-3 border-t border-ink-100">
          <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Resubmitting…' : 'Resubmit Booking'}</button>
        </div>
      </form>
    </>
  );
}
