import { useRouter } from 'next/navigation';
import { useState } from 'react';
import NotificationsMenu from './NotificationsMenu';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/calendar': 'Calendar',
  '/availability': 'Availability',
  '/bookings': 'Bookings',
  '/bookings/new': 'New Booking',
  '/events': 'Events',
  '/closure': 'Closure',
  '/approvals': 'Approval Queue',
  '/resources': 'Resource Management',
  '/issues': 'Issues',
  '/reports': 'Reports',
  '/users': 'Users',
  '/contacts': 'Contacts',
  '/settings': 'Settings',
  '/audit-log': 'Audit Log',
};

function currentTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const base = '/' + pathname.split('/')[1];
  return PAGE_TITLES[base] || 'IIC Event Management';
}

export default function TopBar({ onOpenMenu }) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  function submitSearch(e) {
    e.preventDefault();
    if (search.trim()) router.push(`/bookings?search=${encodeURIComponent(search.trim())}`);
  }

  return (
    <header className="sticky top-0 z-30 bg-surface/85 backdrop-blur-md border-b border-ink-150">
      <div className="flex items-center gap-3 px-4 sm:px-6 h-14">
        <button onClick={onOpenMenu} className="lg:hidden h-9 w-9 flex items-center justify-center rounded-md text-ink-600 hover:bg-ink-100 active:scale-95 transition-all" aria-label="Open menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <p className="text-sm font-semibold text-ink-800 lg:hidden">{currentTitle(router.pathname)}</p>
        <p className="hidden lg:block text-sm text-ink-500">{currentTitle(router.pathname)}</p>

        <form onSubmit={submitSearch} className="ml-auto hidden md:block w-64">
          <div className="relative">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bookings…"
              className="w-full rounded-md border border-ink-150 bg-white/70 pl-9 pr-3 py-1.5 text-sm placeholder:text-ink-400 transition-all focus:outline-none focus:ring-[3px] focus:ring-brand-600/[0.15] focus:border-brand-600 focus:bg-white"
            />
          </div>
        </form>

        <div className="ml-auto md:ml-3 flex items-center gap-1">
          <NotificationsMenu />
        </div>
      </div>
    </header>
  );
}
