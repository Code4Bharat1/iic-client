import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useApi } from '@/lib/useApi';
import { api } from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingState from '@/components/ui/LoadingState';
import EmptyState from '@/components/ui/EmptyState';
import PhotoUploader from '@/components/ui/PhotoUploader';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import { CLOSURE_CHECKLIST_ITEMS, PHOTO_CATEGORIES, formatDate, formatTimeRange } from '@/lib/constants';

export default function ClosureDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: booking, loading, refetch, setData } = useApi(id ? `/bookings/${id}` : null, [id]);

  const [checklist, setChecklist] = useState(null);
  const [uploadingCategory, setUploadingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);

  if (loading) return <LoadingState rows={8} />;
  if (!booking) return <EmptyState title="Booking not found" />;

  const isOwner = booking.createdBy === user.userId;
  const canVerify = user.role === 'admin' || user.role === 'master_admin';
  const activeChecklist = checklist || booking.closure?.checklist || {};
  const photos = booking.closure?.photos || {};
  const submitted = !!booking.closure?.submittedAt;

  const checklistComplete = CLOSURE_CHECKLIST_ITEMS.every((item) => activeChecklist[item.key]);
  const photosComplete = PHOTO_CATEGORIES.every((cat) => (photos[cat.key] || []).length > 0);
  const canSubmit = checklistComplete && photosComplete;

  async function handleUpload(categoryKey, file) {
    setUploadingCategory(categoryKey);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('category', categoryKey);
      const res = await api.upload(`/bookings/${id}/closure/photo`, formData);
      setData((prev) => ({ ...prev, closure: { ...prev.closure, photos: res.photos } }));
    } catch (err) {
      toast(err.message || 'Photo upload failed.', 'error');
    } finally {
      setUploadingCategory(null);
    }
  }

  function toggleChecklistItem(key) {
    setChecklist({ ...activeChecklist, [key]: !activeChecklist[key] });
  }

  async function handleSubmitClosure() {
    setSubmitting(true);
    try {
      const updated = await api.post(`/bookings/${id}/closure/submit`, { checklist: activeChecklist });
      setData(updated);
      toast('Closure submitted.', 'success');
    } catch (err) {
      toast(err.message || 'Unable to submit closure.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify() {
    await api.post(`/bookings/${id}/closure/verify`);
    toast('Event marked as closed.', 'success');
    router.push('/closure');
  }

  const isReadOnlyForOrganiser = !isOwner || submitted || booking.status !== 'awaiting_closure';

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="Complete Event Closure" subtitle={`${booking.eventName} · ${booking.bookingRef}`} actions={<StatusBadge status={booking.status} />} />

      <div className="card p-4 sm:p-5 mb-5 grid sm:grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-ink-500">Floor / Time</p>
          <p className="font-medium text-ink-900">{formatTimeRange(booking.startTime, booking.endTime)}</p>
        </div>
        <div>
          <p className="text-ink-500">Date</p>
          <p className="font-medium text-ink-900">{formatDate(booking.date)}</p>
        </div>
        <div>
          <p className="text-ink-500">Organiser</p>
          <p className="font-medium text-ink-900">{booking.organiser?.name}</p>
        </div>
      </div>

      {submitted && booking.status === 'awaiting_closure' && !canVerify && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 mb-5 text-sm text-amber-800">
          Closure submitted on {new Date(booking.closure.submittedAt).toLocaleString()}. Awaiting admin verification.
        </div>
      )}

      <div className="card p-4 sm:p-5 mb-5">
        <h2 className="text-sm font-semibold text-ink-900 mb-3">Closure Checklist</h2>
        <div className="space-y-2">
          {CLOSURE_CHECKLIST_ITEMS.map((item) => (
            <label key={item.key} className={`flex items-center gap-2.5 text-sm rounded-md px-3 py-2 ${isReadOnlyForOrganiser && !canVerify ? '' : 'hover:bg-ink-50 cursor-pointer'}`}>
              <input
                type="checkbox"
                checked={!!activeChecklist[item.key]}
                onChange={() => toggleChecklistItem(item.key)}
                disabled={isReadOnlyForOrganiser}
              />
              <span className={activeChecklist[item.key] ? 'text-ink-800' : 'text-ink-500'}>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="card p-4 sm:p-5 mb-5">
        <h2 className="text-sm font-semibold text-ink-900 mb-4">Closure Photographs</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {PHOTO_CATEGORIES.map((cat) => (
            <PhotoUploader
              key={cat.key}
              label={cat.label}
              photos={photos[cat.key] || []}
              uploading={uploadingCategory === cat.key}
              onUpload={(file) => handleUpload(cat.key, file)}
            />
          ))}
        </div>
      </div>

      {!isReadOnlyForOrganiser && (
        <div className="card p-4 sm:p-5 mb-5">
          {!canSubmit && (
            <p className="text-sm text-amber-700 mb-3">
              {!checklistComplete && 'Complete the full checklist. '}
              {!photosComplete && 'Upload at least one photo for every category.'}
            </p>
          )}
          <button className="btn-primary w-full" onClick={handleSubmitClosure} disabled={!canSubmit || submitting}>
            {submitting ? 'Submitting…' : 'Submit Closure'}
          </button>
        </div>
      )}

      {canVerify && ['awaiting_closure', 'issue_reported'].includes(booking.status) && (
        <div className="card p-4 sm:p-5 flex flex-col sm:flex-row gap-2.5">
          <button className="btn-primary flex-1" onClick={() => setVerifyOpen(true)} disabled={!submitted && booking.status === 'awaiting_closure'}>
            Verify &amp; Close
          </button>
          <button className="btn-danger flex-1" onClick={() => setIssueOpen(true)}>
            Report Issue
          </button>
        </div>
      )}

      <ConfirmDialog
        open={verifyOpen}
        onClose={() => setVerifyOpen(false)}
        onConfirm={handleVerify}
        title="Mark event as closed?"
        description="This confirms the closure has been reviewed and releases reserved resources."
        confirmLabel="Verify & Close"
      />

      <ReportIssueModal open={issueOpen} onClose={() => setIssueOpen(false)} booking={booking} onDone={() => { setIssueOpen(false); refetch(); }} />
    </div>
  );
}

function ReportIssueModal({ open, onClose, booking, onDone }) {
  const { toast } = useToast();
  const [resourceName, setResourceName] = useState('');
  const [issueType, setIssueType] = useState('damaged');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleUpload(file) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const res = await api.upload('/issues/photo', formData);
      setPhotos((prev) => [...prev, res.url]);
    } catch (err) {
      toast(err.message || 'Photo upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    if (!resourceName) return;
    setSubmitting(true);
    try {
      await api.post('/issues', { bookingId: booking._id, resourceName, issueType, description, photos });
      toast('Issue reported.', 'success');
      onDone();
    } catch (err) {
      toast(err.message || 'Unable to report issue.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Report Issue"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-danger" onClick={submit} disabled={!resourceName || submitting}>
            {submitting ? 'Submitting…' : 'Submit Issue'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="field-label">Resource</label>
          <select className="field-input" value={resourceName} onChange={(e) => setResourceName(e.target.value)}>
            <option value="">Select resource</option>
            {(booking.resources || []).map((r) => (
              <option key={r.resource} value={r.name}>{r.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="field-label">Issue Type</label>
          <select className="field-input" value={issueType} onChange={(e) => setIssueType(e.target.value)}>
            <option value="missing">Missing</option>
            <option value="damaged">Damaged</option>
            <option value="misplaced">Misplaced</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="field-label">Description</label>
          <textarea className="field-input min-h-[80px]" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <PhotoUploader label="Supporting Photos" photos={photos} uploading={uploading} onUpload={handleUpload} />
      </div>
    </Modal>
  );
}
