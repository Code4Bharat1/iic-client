import Link from 'next/link';
import { useRouter } from 'next/router';
import { getNavSections } from './navConfig';
import { ROLE_LABELS } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';

function NavIcon({ path }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d={path} />
    </svg>
  );
}

export function SidebarContent({ onNavigate }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const sections = getNavSections(user?.role);

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-md bg-brand-800 flex items-center justify-center text-white text-sm font-semibold">IIC</div>
          <div>
            <p className="text-sm font-semibold text-ink-900 leading-tight">IIC Event Management</p>
            <p className="text-xs text-ink-500 leading-tight">Venue &amp; resource operations</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">{section.title}</p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = router.pathname === item.href || router.pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors ${
                      active ? 'bg-brand-50 text-brand-800' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
                    }`}
                  >
                    <NavIcon path={item.icon} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-ink-100 p-3">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
          <div className="h-8 w-8 rounded-full bg-ink-800 text-white flex items-center justify-center text-xs font-semibold shrink-0">
            {(user?.name || '?')
              .split(' ')
              .map((w) => w[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink-900 truncate">{user?.name}</p>
            <p className="text-xs text-ink-500 truncate">{ROLE_LABELS[user?.role]}</p>
          </div>
        </div>
        <button onClick={logout} className="btn-ghost w-full mt-1 justify-start text-red-600 hover:bg-red-50">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Log out
        </button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:flex-col w-[260px] shrink-0 border-r border-ink-200 bg-white h-screen sticky top-0">
      <SidebarContent />
    </aside>
  );
}
