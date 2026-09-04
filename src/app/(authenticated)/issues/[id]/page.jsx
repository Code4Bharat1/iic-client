'use client';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useApi } from '@/hooks/useApi';
import { api } from '@/services/api-client';
import PageHeader from '@/components/ui/PageHeader';
import LoadingState from '@/components/ui/LoadingState';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { ISSUE_TYPE_LABELS } from '@/lib/constants';

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-ink-50 last:border-0">
      <dt className="text-sm text-ink-500">{label}</dt>
      <dd className="text-sm text-ink-800 font-medium text-right">{value || '—'}</dd>
    </div>
  );
}

export default function IssueDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: issue, loading, refetch } = useApi(id ? `/issues/${id}` : null, [id]);
  const [resolveOpen, setResolveOpen] = useState(false);

  if (loading) return <LoadingState rows={6} />;
  if (!issue) return <EmptyState title="Issue not found" />;

  const canResolve = (user.role === 'admin' || user.role === 'master_admin') && ['open', 'under_review'].includes(issue.status);

  async function handleResolve(resolution) {
    await api.post(`/issues/${id}/resolve`, { resolution, status: 'resolved' });
    toast('Issue resolved.', 'success');
    refetch();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title={issue.issueId} subtitle={`${issue.resourceName} · ${ISSUE_TYPE_LABELS[issue.issueType]}`} />

      <div className="card p-4 sm:p-5 mb-5">
        <dl>
          <Row label="Booking" value={<Link href={`/bookings/${issue.booking?._id || issue.booking}`} className="text-brand-700 hover:underline">{issue.bookingRef}</Link>} />
          <Row label="Resource" value={issue.resourceName} />
          <Row label="Issue Type" value={ISSUE_TYPE_LABELS[issue.issueType]} />
          <Row label="Description" value={issue.description} />
          <Row label="Reported By" value={issue.reportedBy} />
          <Row label="Reported Date" value={new Date(issue.reportedAt).toLocaleString()} />
          <Row label="Status" value={<span className="capitalize">{issue.status.replace('_', ' ')}</span>} />
        </dl>
      </div>

      {issue.photos?.length > 0 && (
        <div className="card p-4 sm:p-5 mb-5">
          <h2 className="text-sm font-semibold text-ink-900 mb-3">Supporting Photos</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {issue.photos.map((url) => (
              <img key={url} src={url} alt="" className="h-24 w-full object-cover rounded border border-ink-200" />
            ))}
          </div>
        </div>
      )}

      {(issue.resolution || issue.resolvedBy) && (
        <div className="card p-4 sm:p-5 mb-5">
          <h2 className="text-sm font-semibold text-ink-900 mb-3">Resolution</h2>
          <dl>
            <Row label="Resolution" value={issue.resolution} />
            <Row label="Resolved By" value={issue.resolvedBy} />
            <Row label="Resolved Date" value={issue.resolvedAt ? new Date(issue.resolvedAt).toLocaleString() : ''} />
          </dl>
        </div>
      )}

      {canResolve && (
        <button className="btn-primary w-full" onClick={() => setResolveOpen(true)}>
          Mark as Resolved
        </button>
      )}

      <ConfirmDialog
        open={resolveOpen}
        onClose={() => setResolveOpen(false)}
        onConfirm={handleResolve}
        title="Resolve Issue"
        confirmLabel="Mark Resolved"
        requireReason
        reasonLabel="Resolution notes"
        reasonPlaceholder="e.g. Replaced with a working microphone."
      />
    </div>
  );
}
