import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api-client';
import { useApi } from '@/hooks/useApi';

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();
  const { data, refetch, setData } = useApi('/notifications');
  const notifications = data || [];
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    const interval = setInterval(refetch, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  async function markAllRead() {
    await api.post('/notifications/read-all');
    setData((prev) => (prev || []).map((n) => ({ ...n, read: true })));
  }

  async function handleClick(n) {
    if (!n.read) {
      api.post(`/notifications/${n._id}/read`).catch(() => {});
      setData((prev) => prev.map((x) => (x._id === n._id ? { ...x, read: true } : x)));
    }
    setOpen(false);
    if (n.booking) router.push(`/bookings/${n.booking}`);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative h-9 w-9 flex items-center justify-center rounded-md text-ink-600 hover:bg-ink-100"
        aria-label="Notifications"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] card shadow-popover z-40 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100">
            <p className="text-sm font-semibold text-ink-900">Notifications</p>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-brand-700 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && <p className="text-sm text-ink-500 px-4 py-6 text-center">No notifications yet.</p>}
            {notifications.map((n) => (
              <button
                key={n._id}
                onClick={() => handleClick(n)}
                className={`w-full text-left px-4 py-3 border-b border-ink-50 last:border-0 hover:bg-ink-50 ${!n.read ? 'bg-brand-50/40' : ''}`}
              >
                <p className="text-sm text-ink-800 leading-snug">{n.message}</p>
                <p className="mt-1 text-xs text-ink-400">{timeAgo(n.createdAt)}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
