export const STATUS_LABELS = {
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  change_requested: 'Change Requested',
  confirmed: 'Confirmed',
  rejected: 'Rejected',
  event_in_progress: 'Event In Progress',
  awaiting_closure: 'Awaiting Closure',
  issue_reported: 'Issue Reported',
  closed: 'Closed',
};

export const STATUS_STYLES = {
  draft: 'bg-ink-100 text-ink-600 border-ink-200',
  pending_approval: 'bg-amber-50 text-amber-700 border-amber-200',
  change_requested: 'bg-violet-50 text-violet-700 border-violet-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  event_in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  awaiting_closure: 'bg-orange-50 text-orange-700 border-orange-200',
  issue_reported: 'bg-rose-50 text-rose-700 border-rose-200',
  closed: 'bg-ink-100 text-ink-600 border-ink-200',
};

export const LIFECYCLE_STAGES = [
  'pending_approval',
  'confirmed',
  'event_in_progress',
  'awaiting_closure',
  'closed',
];

export const FLOOR_LABELS = {
  ground: 'Ground Floor',
  basement: 'Basement',
  first: '1st Floor',
  second: '2nd Floor',
  third: '3rd Floor',
};

export const ISSUE_TYPE_LABELS = {
  missing: 'Missing',
  damaged: 'Damaged',
  misplaced: 'Misplaced',
  other: 'Other',
};

export const ISSUE_STATUS_STYLES = {
  open: 'bg-red-50 text-red-700 border-red-200',
  under_review: 'bg-amber-50 text-amber-700 border-amber-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed: 'bg-ink-100 text-ink-600 border-ink-200',
};

export const CLOSURE_CHECKLIST_ITEMS = [
  { key: 'floorPhotographed', label: 'Floor photographed after event' },
  { key: 'tablesChairsReturned', label: 'Tables and chairs returned/arranged' },
  { key: 'tvPhotographed', label: 'Interactive TV photographed' },
  { key: 'micPhotographed', label: 'Microphones/equipment photographed' },
  { key: 'otherPhotographed', label: 'Other issued resources photographed' },
];

export const PHOTO_CATEGORIES = [
  { key: 'overallFloor', label: 'Overall Floor' },
  { key: 'tablesChairs', label: 'Tables & Chairs' },
  { key: 'interactiveTV', label: 'Interactive TV' },
  { key: 'microphones', label: 'Microphones / Equipment' },
  { key: 'other', label: 'Other Resources' },
];

export const ROLE_LABELS = {
  organiser: 'Organiser / Authorised User',
  admin: 'Admin',
  master_admin: 'Master Admin',
};

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatTimeRange(start, end) {
  const fmt = (t) => {
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 === 0 ? 12 : h % 12;
    return `${hour}:${String(m).padStart(2, '0')} ${period}`;
  };
  return `${fmt(start)} – ${fmt(end)}`;
}
