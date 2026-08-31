import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const DEMO_ROLES = [
  {
    role: 'organiser',
    name: 'Event Organiser',
    title: 'Continue as Organiser',
    description: 'Create bookings, track approvals, complete closure.',
  },
  {
    role: 'admin',
    name: 'IIC Operations Admin',
    title: 'Continue as Admin',
    description: 'Review approvals, manage resources, verify closure.',
  },
  {
    role: 'master_admin',
    name: 'System Administrator',
    title: 'Continue as Master Admin',
    description: 'Full system control, overrides and configuration.',
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [busyRole, setBusyRole] = useState(null);
  const [credError, setCredError] = useState('');

  useEffect(() => {
    if (router.isReady && router.query.expired) {
      toast('Your session has ended. Please sign in again.', 'error');
      router.replace('/login', undefined, { shallow: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.expired]);

  async function handleDemoLogin(role) {
    setBusyRole(role);
    try {
      await login(role);
      router.push('/dashboard');
    } catch (err) {
      toast(err.message || 'Unable to sign in.', 'error');
    } finally {
      setBusyRole(null);
    }
  }

  function handleManualSubmit(e) {
    e.preventDefault();
    setCredError('Authorised User ID and password sign-in is not enabled in this preview. Use a demo access option below.');
  }

  return (
    <div className="min-h-screen bg-brand-950 flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-brand-800/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-brand-700/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="h-11 w-11 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white font-semibold">IIC</div>
          <div>
            <p className="text-white font-semibold leading-tight">IIC Event Management</p>
            <p className="text-brand-200 text-xs leading-tight">Venue, resource and event operations</p>
          </div>
        </div>

        <div className="card p-6 sm:p-7">
          <h1 className="text-lg font-semibold text-ink-900">Sign in</h1>
          <p className="text-sm text-ink-500 mt-1 mb-5">Authorised institutional access only.</p>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="field-label">Authorised User ID</label>
              <input className="field-input" placeholder="e.g. ORG-1001" autoComplete="username" />
            </div>
            <div>
              <label className="field-label">Password</label>
              <input type="password" className="field-input" placeholder="••••••••" autoComplete="current-password" />
            </div>
            {credError && <p className="field-error -mt-2">{credError}</p>}
            <button type="submit" className="btn-primary w-full">
              Sign In
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ink-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs font-medium uppercase tracking-wide text-ink-400">Demo Access</span>
            </div>
          </div>

          <div className="space-y-2.5">
            {DEMO_ROLES.map((opt) => (
              <button
                key={opt.role}
                onClick={() => handleDemoLogin(opt.role)}
                disabled={busyRole !== null}
                className="w-full flex items-center justify-between gap-3 rounded-md border border-ink-200 px-3.5 py-3 text-left hover:border-brand-600 hover:bg-brand-50/40 transition-colors disabled:opacity-60"
              >
                <div>
                  <p className="text-sm font-medium text-ink-900">{opt.title}</p>
                  <p className="text-xs text-ink-500 mt-0.5">{opt.description}</p>
                </div>
                {busyRole === opt.role ? (
                  <span className="text-xs text-ink-400">Signing in…</span>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-400 shrink-0">
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-brand-200/70 mt-6">
          Internal institutional system · Interactive Innovation Council
        </p>
      </div>
    </div>
  );
}
