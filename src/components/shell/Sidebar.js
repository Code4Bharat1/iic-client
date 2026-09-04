import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getNavSections } from './navConfig';
import { ROLE_LABELS } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';

function NavIcon({ path }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
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
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-md bg-brand-900 flex items-center justify-center text-white text-[13px] font-semibold tracking-tight">IIC</div>
          <div>
            <p className="text-sm font-semibold text-ink-900 leading-tight tracking-[-0.01em]">IIC Event Management</p>
            <p className="text-[11px] text-ink-500 leading-tight mt-px">Venue &amp; resource operations</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-1 space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="px-2.5 mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-400">{section.title}</p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = router.pathname === item.href || router.pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={`relative flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-sm font-medium transition-all duration-150 ${
                      active ? 'bg-brand-100/70 text-brand-900' : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
                    }`}
                  >
                    {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-brand-700" />}
                    <NavIcon path={item.icon} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-ink-150 p-3">
        <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
          <div className="h-8 w-8 rounded-lg bg-brand-900 text-white flex items-center justify-center text-xs font-semibold shrink-0">
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
        <button onClick={logout} className="btn-ghost w-full mt-1 justify-start text-red-700 hover:bg-red-50">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
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
    <aside className="hidden lg:flex lg:flex-col w-[260px] shrink-0 border-r border-ink-150 bg-ink-50/60 h-screen sticky top-0">
      <SidebarContent />
    </aside>
  );
}
