import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar, { SidebarContent } from './Sidebar';
import TopBar from './TopBar';
import { useAuth } from '@/context/AuthContext';

export default function AppShell({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [router.pathname]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-sm text-ink-400">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar />

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-ink-900/40" onClick={() => setMobileOpen(false)} />
          <div className="relative w-[280px] max-w-[85vw] bg-white h-full shadow-popover">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar onOpenMenu={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 sm:px-6 py-6 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
