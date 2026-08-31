import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useApi } from '@/lib/useApi';
import { api, ApiError } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import LoadingState from '@/components/ui/LoadingState';
import EmptyState from '@/components/ui/EmptyState';
import { FLOOR_LABELS, formatDate, formatTimeRange } from '@/lib/constants';

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-ink-50 last:border-0">
      <dt className="text-sm text-ink-500">{label}</dt>
      <dd className="text-sm text-ink-800 font-medium text-right">{value ?? '—'}</dd>
    </div>
  );
}

export default function ApprovalWorkspacePage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: booking, loading } = useApi(id ? `/bookings/${id}` : null, [id]);
  const { data: competingRequests } = useApi(id ? `/bookings/${id}/competing` : null, [id]);

  const [availability, setAvailability] = useState(null);
  const [checking, setChecking] = useState(true);
  const [dialog, setDialog] = useState(null); // 'approve' | 'reject' | 'changes' | 'override'
  const [busy, setBusy] = useState(false);
  const [conflictInfo, setConflictInfo] = useState(null);

  useEffect(() => {
    if (!booking) return;
    setChecking(true);
    api
      .get(`/availability/check?floor=${booking.floor}&date=${booking.date}&start=${booking.startTime}&end=${booking.endTime}`)
      .then(setAvailability)
      .finally(() => setChecking(false));
  }, [booking?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || checking) return <LoadingState rows={8} />;
  if (!booking) return <EmptyState title="Booking not found" />;

  async function runApprove(overrideReason) {
    setBusy(true);
    try {
      await api.post(`/bookings/${id}/approve`, overrideReason ? { override: true, overrideReason } : {});
      toast('Booking approved.', 'success');
      router.push('/approvals');
    } catch (err) {
      if (err instanceof ApiError && err.payload?.conflict) {
        setConflictInfo(err.payload);
        setDialog(null);
        toast('Conflict detected.', 'error');
      } else {
        toast(err.message || 'Unable to approve booking.', 'error');
      }
    } finally {
      setBusy(false);
    }
  }

  async function runReject(reason) {
    await api.post(`/bookings/${id}/reject`, { reason });
    toast('Booking rejected.', 'success');
    router.push('/approvals');
  }

  async function runRequestChanges(comment) {
    await api.post(`/bookings/${id}/request-changes`, { comment });
    toast('Changes requested.', 'success');
    router.push('/approvals');
  }

  const actionable = ['pending_approval', 'change_requested'].includes(booking.status);
  const otherPendingSameFloor = (availability?.conflicts || []).filter((c) => c.id !== booking._id);

  return (
    <>
      <PageHeader title="Approval Workspace" subtitle={`${booking.eventName} · ${booking.bookingRef}`} actions={<StatusBadge status={booking.status} />} />

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="space-y-5">
          <div className="card p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-ink-900 mb-3">Booking Details</h2>
            <dl>
              <Row label="Event" value={booking.eventName} />
              <Row label="Purpose" value={booking.purpose} />
              <Row label="Attendance" value={booking.expectedAttendance} />
              <Row label="Organiser" value={booking.organiser?.name} />
              <Row label="Department" value={booking.organiser?.department} />
              <Row label="Floor" value={FLOOR_LABELS[booking.floor]} />
              <Row label="Date" value={formatDate(booking.date)} />
              <Row label="Time" value={formatTimeRange(booking.startTime, booking.endTime)} />
            </dl>
          </div>

          <div className="card p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-ink-900 mb-3">Requested Resources</h2>
            {booking.resources.length === 0 ? (
              <p className="text-sm text-ink-500">No resources requested.</p>
            ) : (
              <dl>
                {booking.resources.map((r) => (
                  <Row key={r.resource} label={r.name} value={r.unitType === 'toggle' ? 'Requested' : r.quantity} />
                ))}
              </dl>
            )}
            {booking.specialRequirements && (
              <p className="text-sm text-ink-600 mt-3 italic">&ldquo;{booking.specialRequirements}&rdquo;</p>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className={`card p-4 sm:p-5 border ${availability?.available ? 'border-emerald-200' : 'border-red-200'}`}>
            <h2 className="text-sm font-semibold text-ink-900 mb-3">Availability Analysis</h2>
            {availability?.available ? (
              <p className="text-sm font-medium text-emerald-700 mb-3">Floor is available — no conflicts detected.</p>
            ) : (
              <div className="mb-3">
                <p className="text-sm font-medium text-red-700 mb-1.5">Conflict detected</p>
                {otherPendingSameFloor.map((c) => (
                  <p key={c.id} className="text-sm text-ink-600">
                    {c.eventName} already reserves this floor {c.startTime}–{c.endTime}.
                  </p>
                ))}
              </div>
            )}
            <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-400 mt-4 mb-2">Resource Availability</h3>
            <div className="space-y-2">
              {(availability?.resources || []).map((r) => {
                const requestedLine = booking.resources.find((line) => line.resource === r.resourceId || String(line.resource) === r.resourceId);
                const requested = requestedLine?.quantity || 0;
                const short = requested > r.available;
                return (
                  <div key={r.resourceId} className={`flex justify-between text-sm rounded px-2.5 py-1.5 ${short ? 'bg-red-50 text-red-700' : 'bg-ink-50 text-ink-700'}`}>
                    <span>{r.name}</span>
                    <span className="font-medium">
                      {requested > 0 ? `${requested} requested · ` : ''}{r.available} available
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {competingRequests?.length > 0 && (
            <div className="card p-4 sm:p-5 border border-amber-200 bg-amber-50/40">
              <h2 className="text-sm font-semibold text-ink-900 mb-1">Competing Pending Requests</h2>
              <p className="text-xs text-ink-500 mb-3">
                These bookings also await approval and overlap this floor and time. Approving more than one will create a conflict.
              </p>
              <div className="space-y-2">
                {competingRequests.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => router.push(`/approvals/${c.id}`)}
                    className="w-full text-left rounded-md border border-amber-200 bg-white px-3 py-2 hover:border-amber-400"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-ink-900 truncate">{c.eventName}</p>
                      <span className="text-xs text-amber-700 font-medium capitalize">{c.status.replace('_', ' ')}</span>
                    </div>
                    <p className="text-xs text-ink-500 mt-0.5">
                      {c.bookingRef} · {c.startTime}–{c.endTime}
                      {c.resources.length > 0 && ` · ${c.resources.map((r) => `${r.quantity ? r.quantity + ' ' : ''}${r.name}`).join(', ')}`}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {conflictInfo && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p className="font-medium mb-1">{conflictInfo.message}</p>
              {user.role === 'master_admin' && conflictInfo.canOverride && (
                <button className="btn-danger mt-2" onClick={() => setDialog('override')}>
                  Override Conflict
                </button>
              )}
            </div>
          )}

          {actionable && (
            <div className="card p-4 sm:p-5">
              <h2 className="text-sm font-semibold text-ink-900 mb-3">Actions</h2>
              <div className="flex flex-col gap-2.5">
                <button className="btn-primary" onClick={() => setDialog('approve')} disabled={busy}>
                  Approve Booking
                </button>
                <button className="btn-secondary" onClick={() => setDialog('changes')} disabled={busy}>
                  Request Changes
                </button>
                <button className="btn-danger" onClick={() => setDialog('reject')} disabled={busy}>
                  Reject Booking
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={dialog === 'approve'}
        onClose={() => setDialog(null)}
        onConfirm={() => runApprove()}
        title="Approve this booking?"
        description="Approval will lock the floor and reserve the approved resources."
        confirmLabel="Approve Booking"
      />
      <ConfirmDialog
        open={dialog === 'reject'}
        onClose={() => setDialog(null)}
        onConfirm={runReject}
        title="Reject Booking"
        tone="danger"
        confirmLabel="Reject Booking"
        requireReason
        reasonLabel="Rejection reason"
        reasonPlaceholder="Explain why this booking is being rejected…"
      />
      <ConfirmDialog
        open={dialog === 'changes'}
        onClose={() => setDialog(null)}
        onConfirm={runRequestChanges}
        title="Request Changes"
        confirmLabel="Send Request"
        requireReason
        reasonLabel="Comment to organiser"
        reasonPlaceholder="e.g. Please reduce chair quantity to 60 due to availability."
      />
      <ConfirmDialog
        open={dialog === 'override'}
        onClose={() => setDialog(null)}
        onConfirm={(reason) => runApprove(reason)}
        title="Override Conflict"
        description="Override requires justification. This action will be recorded in the audit log."
        confirmLabel="Confirm Override"
        tone="danger"
        requireReason
        reasonLabel="Reason"
        requireCheckbox="I understand this override will be recorded in the audit log."
      />
    </>
  );
}
