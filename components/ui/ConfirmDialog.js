import { useState } from 'react';
import Modal from './Modal';

// Generic confirm/action dialog. Pass `requireReason` to render a required textarea
// (used for reject/request-changes/override) whose value is passed to onConfirm.
export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  tone = 'primary',
  requireReason = false,
  reasonLabel = 'Reason',
  reasonPlaceholder = '',
  requireCheckbox,
}) {
  const [reason, setReason] = useState('');
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = (!requireReason || reason.trim().length > 0) && (!requireCheckbox || checked);

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await onConfirm(reason.trim());
      setReason('');
      setChecked(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            className={tone === 'danger' ? 'btn-danger' : 'btn-primary'}
            onClick={handleConfirm}
            disabled={!canSubmit || submitting}
          >
            {submitting ? 'Please wait…' : confirmLabel}
          </button>
        </>
      }
    >
      {description && <p className="text-sm text-ink-600 mb-4">{description}</p>}
      {requireReason && (
        <div>
          <label className="field-label">{reasonLabel}</label>
          <textarea
            className="field-input min-h-[90px]"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={reasonPlaceholder}
            autoFocus
          />
        </div>
      )}
      {requireCheckbox && (
        <label className="mt-3 flex items-start gap-2 text-sm text-ink-700">
          <input type="checkbox" className="mt-0.5" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
          {requireCheckbox}
        </label>
      )}
    </Modal>
  );
}
