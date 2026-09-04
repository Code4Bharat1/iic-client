'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useApi } from '@/hooks/useApi';
import { api } from '@/services/api-client';
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
  const params = useParams();
  const id = params?.id;
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: booking, loading, refetch, setData } = useApi(id ? `/bookings/${id}` : null, [id]);

  const [checklist, setChecklist] = useState(null);
  const [uploadingCategory, setUploadingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueResource, setIssueResource] = useState('');

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

  function openIssueForResource(resourceLabel) {
    setIssueResource(resourceLabel);
    setIssueOpen(true);
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
        <h2 className="text-sm font-semibold text-ink-900 mb-1">Closure Photographs</h2>
        <p className="text-xs text-ink-500 mb-4">Click a card to report an issue with that resource.</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {PHOTO_CATEGORIES.map((cat) => (
            <div
              key={cat.key}
              className="group relative"
            >
              <PhotoUploader
                label={cat.label}
                photos={photos[cat.key] || []}
                uploading={uploadingCategory === cat.key}
                onUpload={(file) => handleUpload(cat.key, file)}
              />
              {/* Clickable overlay to report an issue for this resource */}
              <button
                type="button"
                onClick={() => openIssueForResource(cat.label)}
                className="absolute top-2 right-2 text-xs text-red-600 hover:text-red-800 font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded px-1.5 py-0.5 border border-red-200 shadow-sm"
              >
                Report issue
              </button>
            </div>
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
          {/* Report Issue button → navigates directly to /issues, no modal */}
          <button className="btn-danger flex-1" onClick={() => router.push('/issues')}>
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

      <ReportIssueModal
        open={issueOpen}
        onClose={() => setIssueOpen(false)}
        booking={booking}
        prefilledResource={issueResource}
        onDone={() => { setIssueOpen(false); refetch(); }}
      />
    </div>
  );
}

function ReportIssueModal({ open, onClose, booking, prefilledResource, onDone }) {
  const { toast } = useToast();
  const [resourceName, setResourceName] = useState(prefilledResource || '');
  const [issueType, setIssueType] = useState('damaged');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Sync pre-filled resource whenever the modal opens for a different card
  useEffect(() => {
    if (open) setResourceName(prefilledResource || '');
  }, [open, prefilledResource]);

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
