import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

// A quiet architectural motif — three floor plates, standing in for the venue
// structure the whole product is organised around.
function FloorMotif() {
  return (
    <svg viewBox="0 0 360 320" fill="none" className="w-full h-auto max-w-sm">
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${i * 22}, ${i * 78})`} opacity={1 - i * 0.22}>
          <rect x="0" y="0" width="300" height="150" rx="3" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1" />
          <line x1="0" y1="150" x2="30" y2="180" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" />
          <line x1="300" y1="150" x2="330" y2="180" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" />
          {Array.from({ length: 7 }).map((_, c) => (
            <line key={c} x1={20 + c * 40} y1="14" x2={20 + c * 40} y2="136" stroke="currentColor" strokeOpacity="0.14" strokeWidth="1" />
          ))}
        </g>
      ))}
    </svg>
  );
}

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const identifierRef = useRef(null);

  // If already authenticated, go straight to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/dashboard');
    }
  }, [authLoading, user, router]);

  // Show session-expired toast
  useEffect(() => {
    if (router.isReady && router.query.expired) {
      toast('Your session has ended. Please sign in again.', 'error');
      router.replace('/login', undefined, { shallow: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.expired]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!identifier.trim()) {
      setError('Please enter your Authorised User ID or email.');
      identifierRef.current?.focus();
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    setSubmitting(true);
    try {
      await login(identifier.trim(), password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[100dvh] grid lg:grid-cols-[1.05fr_1fr] bg-surface">
      {/* Left — institutional panel, hidden on small screens */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-brand-950 text-white px-14 py-12">
        <div className="absolute inset-0 bg-grain opacity-[0.05] mix-blend-overlay pointer-events-none" />
        <div className="absolute text-brand-400/70 -right-6 top-1/2 -translate-y-1/2">
          <FloorMotif />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-white/10 border border-white/15 flex items-center justify-center text-sm font-semibold">IIC</div>
          <div>
            <p className="font-semibold leading-tight">IIC Event Management</p>
            <p className="text-brand-200 text-xs leading-tight">Venue, resource and event operations</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <p className="font-display italic text-[2.35rem] leading-[1.15] text-white/95 tracking-tight text-balance">
            One record of every floor, every booking, every closure.
          </p>
          <div className="mt-8 flex items-center gap-6 text-xs text-brand-200/80 tracking-wide">
            <span>3 bookable floors</span>
            <span className="h-1 w-1 rounded-full bg-brand-400/60" />
            <span>Two-month booking window</span>
            <span className="h-1 w-1 rounded-full bg-brand-400/60" />
            <span>Full audit trail</span>
          </div>
        </div>

        <p className="relative text-xs text-brand-200/60">Venue, Resource and Event Operations</p>
      </div>

      {/* Right — sign-in */}
      <div className="flex items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 justify-center mb-9 lg:hidden">
            <div className="h-10 w-10 rounded-md bg-brand-900 flex items-center justify-center text-white text-sm font-semibold">IIC</div>
            <div>
              <p className="text-ink-900 font-semibold leading-tight">IIC Event Management</p>
              <p className="text-ink-500 text-xs leading-tight">Venue, resource and event operations</p>
            </div>
          </div>

          <h1 className="font-display text-[1.7rem] text-ink-900 tracking-[-0.02em]">Sign in</h1>
          <p className="text-sm text-ink-500 mt-1.5 mb-7">Authorised institutional access only.</p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="identifier" className="field-label">Authorised User ID</label>
              <input
                id="identifier"
                ref={identifierRef}
                className="field-input"
                placeholder="e.g. ORG-1001 or email"
                autoComplete="username"
                value={identifier}
                onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                disabled={submitting}
              />
            </div>
            <div>
              <label htmlFor="password" className="field-label">Password</label>
              <input
                id="password"
                type="password"
                className="field-input"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                disabled={submitting}
              />
            </div>

            {error && <p className="field-error -mt-2">{error}</p>}

            <button
              id="sign-in-btn"
              type="submit"
              className="btn-primary w-full"
              disabled={submitting}
            >
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-ink-400 mt-8 lg:hidden" />
        </div>
      </div>
    </div>
  );
}
