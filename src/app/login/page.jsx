'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

function EyeIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

/** Modal shown when mustChangePassword === true after login */
function ChangePasswordModal({ onChanged }) {
  const { changePassword } = useAuth();
  const { toast } = useToast();
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    if (newPw.length < 8) { setErr('New password must be at least 8 characters.'); return; }
    if (newPw !== confirmPw) { setErr('Passwords do not match.'); return; }
    if (newPw === currentPw) { setErr('New password must be different from the temporary password.'); return; }
    setSubmitting(true);
    try {
      await changePassword(currentPw, newPw);
      toast('Password changed successfully! Welcome to IIC.', 'success');
      onChanged();
    } catch (e) {
      setErr(e.message || 'Failed to change password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-brand-950 px-7 py-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-yellow-300 text-lg">🔒</span>
            <h2 className="text-white font-semibold text-lg">Change Your Password</h2>
          </div>
          <p className="text-brand-200 text-sm">
            You are using a temporary password. Please set a new password to continue.
          </p>
        </div>
        {/* Body */}
        <form onSubmit={handleSubmit} className="px-7 py-6 space-y-4">
          <div>
            <label className="field-label">Temporary Password (from email)</label>
            <div className="relative">
              <input
                type={showCurrentPw ? 'text' : 'password'}
                className="field-input pr-10"
                placeholder="Enter the password from your email"
                value={currentPw}
                onChange={(e) => { setCurrentPw(e.target.value); setErr(''); }}
                disabled={submitting}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors p-1"
                title={showCurrentPw ? 'Hide password' : 'Show password'}
                aria-label={showCurrentPw ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showCurrentPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
          <div>
            <label className="field-label">New Password</label>
            <div className="relative">
              <input
                type={showNewPw ? 'text' : 'password'}
                className="field-input pr-10"
                placeholder="At least 8 characters"
                value={newPw}
                onChange={(e) => { setNewPw(e.target.value); setErr(''); }}
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowNewPw((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors p-1"
                title={showNewPw ? 'Hide password' : 'Show password'}
                aria-label={showNewPw ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showNewPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
          <div>
            <label className="field-label">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPw ? 'text' : 'password'}
                className="field-input pr-10"
                placeholder="Re-enter new password"
                value={confirmPw}
                onChange={(e) => { setConfirmPw(e.target.value); setErr(''); }}
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors p-1"
                title={showConfirmPw ? 'Hide password' : 'Show password'}
                aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showConfirmPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
          {err && <p className="field-error">{err}</p>}
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={submitting || !currentPw || !newPw || !confirmPw}
          >
            {submitting ? 'Saving…' : 'Set New Password & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { login, user, loading: authLoading, mustChangePassword } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showChangePw, setShowChangePw] = useState(false);
  const identifierRef = useRef(null);

  // If already authenticated (and no forced pw change), go to dashboard
  useEffect(() => {
    if (!authLoading && user && !mustChangePassword) {
      router.replace('/dashboard');
    }
    // If logged in but must change password, show the modal
    if (!authLoading && user && mustChangePassword) {
      setShowChangePw(true);
    }
  }, [authLoading, user, mustChangePassword, router]);

  // Show session-expired toast
  useEffect(() => {
    if (true && searchParams?.get('expired')) {
      toast('Your session has ended. Please sign in again.', 'error');
      router.replace('/login', undefined, { shallow: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [true, searchParams?.get('expired')]);

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
      const { mustChangePassword: mcp } = await login(identifier.trim(), password);
      if (mcp) {
        setShowChangePw(true);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {showChangePw && (
        <ChangePasswordModal onChanged={() => { setShowChangePw(false); router.push('/dashboard'); }} />
      )}

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
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="field-input pr-10"
                    placeholder={showPassword ? 'Enter your password' : '••••••••'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
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
    </>
  );
}
