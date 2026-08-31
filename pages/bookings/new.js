import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { api, ApiError } from '@/lib/api';
import { useApi } from '@/lib/useApi';
import { useBookableFloors } from '@/lib/floorOptions';
import PageHeader from '@/components/ui/PageHeader';
import Stepper from '@/components/ui/Stepper';
import ResourceQuantityInput from '@/components/ui/ResourceQuantityInput';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { FLOOR_LABELS, formatDate, formatTimeRange } from '@/lib/constants';

const STEPS = ['Event', 'Organiser', 'Venue & Time', 'Resources', 'Review', 'Submitted'];

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function NewBookingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const floors = useBookableFloors();
  const { data: settings } = useApi('/settings');

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});

  const [availability, setAvailability] = useState(null);
  const [checking, setChecking] = useState(false);

  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitIssue, setSubmitIssue] = useState(null);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!user || !router.isReady) return;
    setForm({
      eventName: '',
      purpose: '',
      expectedAttendance: '',
      organiser: {
        name: user.name,
        userId: user.userId,
        department: user.department || '',
        mobile: user.mobile || '',
        email: user.email || '',
      },
      floor: router.query.floor || '',
      date: router.query.date || '',
      startTime: router.query.start || '',
      endTime: router.query.end || '',
      resources: {},
      specialRequirements: '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router.isReady]);

  const maxDate = useMemo(() => {
    if (!settings) return undefined;
    const d = new Date();
    d.setMonth(d.getMonth() + settings.bookingWindowMonths);
    d.setDate(0); // last day of the window's final month
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, [settings]);

  // --- availability check (Step 3: Venue & Time) ---
  useEffect(() => {
    if (!form) return;
    const { floor, date, startTime, endTime } = form;
    if (!floor || !date || !startTime || !endTime || endTime <= startTime) {
      setAvailability(null);
      return;
    }
    let cancelled = false;
    setChecking(true);
    api
      .get(`/availability/check?floor=${floor}&date=${date}&start=${startTime}&end=${endTime}`)
      .then((res) => !cancelled && setAvailability(res))
      .catch(() => !cancelled && setAvailability(null))
      .finally(() => !cancelled && setChecking(false));
    return () => {
      cancelled = true;
    };
  }, [form?.floor, form?.date, form?.startTime, form?.endTime]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- resource catalog (Step 4: Resources) ---
  useEffect(() => {
    if (step !== 3 || !form?.floor) return;
    let cancelled = false;
    setCatalogLoading(true);
    api
      .get(`/resources/catalog?floor=${form.floor}&date=${form.date}&start=${form.startTime}&end=${form.endTime}`)
      .then((res) => !cancelled && setCatalog(res))
      .finally(() => !cancelled && setCatalogLoading(false));
    return () => {
      cancelled = true;
    };
  }, [step, form?.floor, form?.date, form?.startTime, form?.endTime]);

  if (!form) return null;

  function update(patch) {
    setForm((f) => ({ ...f, ...patch }));
  }
  function updateOrganiser(patch) {
    setForm((f) => ({ ...f, organiser: { ...f.organiser, ...patch } }));
  }
  function setResourceQty(resourceId, qty) {
    setForm((f) => ({ ...f, resources: { ...f.resources, [resourceId]: qty } }));
  }

  function validateStep(i) {
    const e = {};
    if (i === 0) {
      if (!form.eventName.trim()) e.eventName = 'Event name is required.';
      if (!form.purpose.trim()) e.purpose = 'Description / purpose is required.';
      if (!form.expectedAttendance || Number(form.expectedAttendance) <= 0) e.expectedAttendance = 'Expected attendance is required.';
    }
    if (i === 1) {
      if (!form.organiser.name.trim()) e.name = 'Name is required.';
      if (!form.organiser.userId.trim()) e.userId = 'Authorised User ID is required.';
    }
    if (i === 2) {
      if (!form.floor) e.floor = 'Floor is required.';
      if (!form.date) e.date = 'Date is required.';
      if (!form.startTime) e.startTime = 'Start time is required.';
      if (!form.endTime) e.endTime = 'End time is required.';
      if (form.startTime && form.endTime && form.endTime <= form.startTime) e.endTime = 'End time must be after start time.';
      if (form.date && maxDate && (form.date < todayIso() || form.date > maxDate)) e.date = 'Booking date outside permitted window.';
      if (!e.date && !e.floor && !e.startTime && !e.endTime && availability && !availability.available && user.role !== 'master_admin') {
        e.availability = 'Time slot unavailable. Choose a different time or floor.';
      }
    }
    if (i === 3) {
      const overRequests = catalog.filter((r) => (form.resources[r.resourceId] || 0) > r.available);
      if (overRequests.length) e.resources = `Reduce quantity for ${overRequests.map((r) => r.name).join(', ')} — exceeds availability.`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function goNext() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }
  function goBack() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  }

  function buildPayload(overrideReason) {
    return {
      eventName: form.eventName.trim(),
      purpose: form.purpose.trim(),
      expectedAttendance: Number(form.expectedAttendance),
      organiser: form.organiser,
      floor: form.floor,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      resources: Object.entries(form.resources)
        .filter(([, qty]) => qty > 0)
        .map(([resourceId, quantity]) => ({ resourceId, quantity })),
      specialRequirements: form.specialRequirements,
      ...(overrideReason ? { override: true, overrideReason } : {}),
    };
  }

  async function submitBooking(overrideReason) {
    setSubmitting(true);
    setSubmitIssue(null);
    try {
      const booking = await api.post('/bookings', buildPayload(overrideReason));
      setResult(booking);
      setStep(5);
      toast('Booking submitted successfully.', 'success');
    } catch (err) {
      if (err instanceof ApiError && (err.payload?.conflict || err.payload?.resourceConflict)) {
        setSubmitIssue(err.payload);
        toast('Conflict detected.', 'error');
      } else {
        toast(err.message || 'Unable to submit booking.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader title="New Booking" subtitle="Reserve a floor and resources for an institutional event." />

      <div className="card p-4 sm:p-6 max-w-3xl">
        <Stepper steps={STEPS} current={step} />

        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="field-label">Event Name *</label>
              <input className="field-input" value={form.eventName} onChange={(e) => update({ eventName: e.target.value })} placeholder="e.g. Annual Research Symposium" />
              {errors.eventName && <p className="field-error">{errors.eventName}</p>}
            </div>
            <div>
              <label className="field-label">Description / Purpose *</label>
              <textarea className="field-input min-h-[100px]" value={form.purpose} onChange={(e) => update({ purpose: e.target.value })} />
              {errors.purpose && <p className="field-error">{errors.purpose}</p>}
            </div>
            <div>
              <label className="field-label">Expected Attendance *</label>
              <input type="number" min={1} className="field-input max-w-[180px]" value={form.expectedAttendance} onChange={(e) => update({ expectedAttendance: e.target.value })} />
              {errors.expectedAttendance && <p className="field-error">{errors.expectedAttendance}</p>}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Name</label>
                <input className="field-input" value={form.organiser.name} onChange={(e) => updateOrganiser({ name: e.target.value })} />
                {errors.name && <p className="field-error">{errors.name}</p>}
              </div>
              <div>
                <label className="field-label">Authorised User ID</label>
                <input className="field-input" value={form.organiser.userId} onChange={(e) => updateOrganiser({ userId: e.target.value })} />
                {errors.userId && <p className="field-error">{errors.userId}</p>}
              </div>
            </div>
            <div>
              <label className="field-label">Organisation / Department</label>
              <input className="field-input" value={form.organiser.department} onChange={(e) => updateOrganiser({ department: e.target.value })} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Mobile</label>
                <input className="field-input" value={form.organiser.mobile} onChange={(e) => updateOrganiser({ mobile: e.target.value })} />
              </div>
              <div>
                <label className="field-label">Email</label>
                <input type="email" className="field-input" value={form.organiser.email} onChange={(e) => updateOrganiser({ email: e.target.value })} />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Floor</label>
                <select className="field-input" value={form.floor} onChange={(e) => update({ floor: e.target.value })}>
                  <option value="">Select floor</option>
                  {floors.map((f) => (
                    <option key={f.key} value={f.key}>{f.name}</option>
                  ))}
                </select>
                {errors.floor && <p className="field-error">{errors.floor}</p>}
              </div>
              <div>
                <label className="field-label">Date</label>
                <input type="date" className="field-input" min={todayIso()} max={maxDate} value={form.date} onChange={(e) => update({ date: e.target.value })} />
                {errors.date && <p className="field-error">{errors.date}</p>}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="field-label">Start Time</label>
                <input type="time" className="field-input" value={form.startTime} onChange={(e) => update({ startTime: e.target.value })} />
                {errors.startTime && <p className="field-error">{errors.startTime}</p>}
              </div>
              <div>
                <label className="field-label">End Time</label>
                <input type="time" className="field-input" value={form.endTime} onChange={(e) => update({ endTime: e.target.value })} />
                {errors.endTime && <p className="field-error">{errors.endTime}</p>}
              </div>
            </div>

            {checking && <p className="text-sm text-ink-500">Checking availability…</p>}
            {!checking && availability && (
              <div className={`rounded-lg border p-4 ${availability.available ? 'border-emerald-200 bg-emerald-50/60' : 'border-red-200 bg-red-50/60'}`}>
                {availability.available ? (
                  <p className="text-sm font-semibold text-emerald-700">AVAILABLE</p>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-red-700 mb-1">CONFLICT DETECTED</p>
                    {availability.conflicts.map((c) => (
                      <p key={c.id} className="text-sm text-ink-700">
                        Another booking exists on this floor from {c.startTime} to {c.endTime} ({c.eventName}).
                      </p>
                    ))}
                    {user.role !== 'master_admin' && (
                      <button className="btn-secondary mt-3" onClick={() => router.push(`/availability?floor=${form.floor}&date=${form.date}`)}>
                        View available slots
                      </button>
                    )}
                    {user.role === 'master_admin' && <p className="text-xs text-ink-500 mt-2">As Master Admin, you may override this conflict on the Review step.</p>}
                  </>
                )}
              </div>
            )}
            {errors.availability && <p className="field-error">{errors.availability}</p>}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            {catalogLoading ? (
              <p className="text-sm text-ink-500">Loading resource availability…</p>
            ) : catalog.length === 0 ? (
              <p className="text-sm text-ink-500">No resources configured for this floor.</p>
            ) : (
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
            )}
            {errors.resources && <p className="field-error">{errors.resources}</p>}
            <div>
              <label className="field-label">Special Arrangements</label>
              <textarea className="field-input min-h-[80px]" value={form.specialRequirements} onChange={(e) => update({ specialRequirements: e.target.value })} placeholder="Any additional setup requirements…" />
            </div>
          </div>
        )}

        {step === 4 && (
          <ReviewStep
            form={form}
            catalog={catalog}
            availability={availability}
            submitIssue={submitIssue}
            isMasterAdmin={user.role === 'master_admin'}
            onOverride={() => setOverrideOpen(true)}
          />
        )}

        {step === 5 && result && <SuccessStep booking={result} />}

        {step < 5 && (
          <div className="flex items-center justify-between mt-8 pt-5 border-t border-ink-100">
            <button className="btn-secondary" onClick={goBack} disabled={step === 0}>
              Back
            </button>
            {step < 4 ? (
              <button className="btn-primary" onClick={goNext}>
                Continue
              </button>
            ) : (
              <button className="btn-primary" onClick={() => submitBooking()} disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Booking'}
              </button>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={overrideOpen}
        onClose={() => setOverrideOpen(false)}
        onConfirm={async (reason) => {
          await submitBooking(reason);
          setOverrideOpen(false);
        }}
        title="Override Conflict"
        description="Override requires justification. This action will be recorded in the audit log."
        confirmLabel="Confirm Override"
        requireReason
        reasonLabel="Reason"
        reasonPlaceholder="Explain why this override is operationally necessary…"
        requireCheckbox="I understand this override will be recorded in the audit log."
      />
    </>
  );
}

function ReviewStep({ form, catalog, availability, submitIssue, isMasterAdmin, onOverride }) {
  const resourceLines = Object.entries(form.resources)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => {
      const res = catalog.find((c) => c.resourceId === id);
      return { name: res?.name || id, qty, unitType: res?.unitType };
    });

  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2">Event</h3>
        <dl className="text-sm space-y-1.5">
          <Row label="Event Name" value={form.eventName} />
          <Row label="Purpose" value={form.purpose} />
          <Row label="Attendance" value={form.expectedAttendance} />
        </dl>
      </section>
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2">Organiser</h3>
        <dl className="text-sm space-y-1.5">
          <Row label="Name" value={form.organiser.name} />
          <Row label="Department" value={form.organiser.department} />
          <Row label="Mobile" value={form.organiser.mobile} />
          <Row label="Email" value={form.organiser.email} />
        </dl>
      </section>
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2">Venue</h3>
        <dl className="text-sm space-y-1.5">
          <Row label="Floor" value={FLOOR_LABELS[form.floor]} />
          <Row label="Date" value={formatDate(form.date)} />
          <Row label="Time" value={formatTimeRange(form.startTime, form.endTime)} />
        </dl>
      </section>
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2">Resources</h3>
        {resourceLines.length === 0 ? (
          <p className="text-sm text-ink-500">No resources requested.</p>
        ) : (
          <dl className="text-sm space-y-1.5">
            {resourceLines.map((r) => (
              <Row key={r.name} label={r.name} value={r.unitType === 'toggle' ? 'Requested' : r.qty} />
            ))}
          </dl>
        )}
        {form.specialRequirements && <p className="text-sm text-ink-600 mt-2 italic">&ldquo;{form.specialRequirements}&rdquo;</p>}
      </section>

      {availability?.available ? (
        <div className="flex items-center gap-2 text-emerald-700 text-sm font-medium bg-emerald-50 border border-emerald-200 rounded-md px-3.5 py-2.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 13 4 4L19 7" /></svg>
          Availability Verified
        </div>
      ) : (
        <div className="text-amber-700 text-sm font-medium bg-amber-50 border border-amber-200 rounded-md px-3.5 py-2.5">
          Availability could not be confirmed for this window.
        </div>
      )}

      {submitIssue && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
          <p className="font-medium mb-1">{submitIssue.message || 'Unable to submit booking.'}</p>
          {submitIssue.errors?.map((e, i) => (
            <p key={i}>{e.message}</p>
          ))}
          {submitIssue.canOverride && isMasterAdmin && (
            <button className="btn-danger mt-2" onClick={onOverride}>
              Override Conflict
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-500">{label}</dt>
      <dd className="text-ink-800 font-medium text-right">{value || '—'}</dd>
    </div>
  );
}

function SuccessStep({ booking }) {
  const router = useRouter();
  return (
    <div className="text-center py-6">
      <div className="mx-auto h-14 w-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-600"><path d="m5 13 4 4L19 7" /></svg>
      </div>
      <h2 className="text-lg font-semibold text-ink-900">Booking Request Submitted</h2>
      <p className="text-sm text-ink-500 mt-1">Booking reference</p>
      <p className="text-xl font-semibold text-brand-800 mt-0.5">{booking.bookingRef}</p>
      <p className="text-sm text-amber-700 mt-3 font-medium">Status: Pending Approval</p>
      <p className="text-sm text-ink-500 mt-2 max-w-sm mx-auto">Your booking has been sent to IIC Administration for review.</p>
      <div className="flex items-center justify-center gap-2.5 mt-6">
        <button className="btn-secondary" onClick={() => router.push('/dashboard')}>Back to Dashboard</button>
        <button className="btn-primary" onClick={() => router.push(`/bookings/${booking._id}`)}>View Booking</button>
      </div>
    </div>
  );
}
