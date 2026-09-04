'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import BookingRow from '@/components/ui/BookingRow';
import EmptyState from '@/components/ui/EmptyState';
import LoadingState from '@/components/ui/LoadingState';
import UtilisationBar from '@/components/ui/UtilisationBar';
import { FLOOR_LABELS, formatDate } from '@/lib/constants';

function ActionRequiredList({ bookings }) {
  const router = useRouter();
  if (!bookings.length) return <p className="text-sm text-ink-500">Nothing needs your attention right now.</p>;
  const reasonFor = (b) => {
    if (b.status === 'change_requested') return 'Booking changes requested';
    if (b.status === 'issue_reported') return 'Issue reported on this event';
    if (b.status === 'awaiting_closure') return 'Closure photos required';
    return 'Action required';
  };
  return (
    <div className="space-y-2">
      {bookings.map((b) => (
        <button
          key={b._id}
          onClick={() => router.push(b.status === 'awaiting_closure' ? `/closure/${b._id}` : `/bookings/${b._id}`)}
          className="w-full text-left flex items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50/60 px-3.5 py-2.5 hover:bg-amber-50"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink-900 truncate">{b.eventName}</p>
            <p className="text-xs text-amber-700 mt-0.5">{reasonFor(b)}</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600 shrink-0">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function OrganiserDashboard({ user }) {
  const { data, loading } = useApi('/dashboard');
  if (loading || !data) return <LoadingState rows={6} />;

  return (
    <>
      <PageHeader
        title={`Good day, ${user.name}`}
        subtitle="Manage your upcoming events and venue bookings."
        actions={
          <>
            <Link href="/bookings/new" className="btn-primary">
              + New Booking
            </Link>
            <Link href="/calendar" className="btn-secondary">
              View Calendar
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard label="Upcoming Events" value={data.stats.upcomingEvents} />
        <StatCard label="Pending Approval" value={data.stats.pendingApproval} tone="warning" />
        <StatCard label="Awaiting Closure" value={data.stats.awaitingClosure} tone="warning" />
        <StatCard label="Confirmed Bookings" value={data.stats.confirmedBookings} tone="success" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-ink-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-900">Upcoming Events</h2>
            <Link href="/bookings" className="text-xs text-brand-700 hover:underline">
              View all
            </Link>
          </div>
          {data.upcoming.length === 0 ? (
            <EmptyState title="No upcoming events" description="Create a new booking to reserve a floor for your event." />
          ) : (
            data.upcoming.map((b) => <BookingRow key={b._id} booking={b} />)
          )}
        </div>

        <div className="card p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-ink-900 mb-3">Action Required</h2>
          <ActionRequiredList bookings={data.actionRequired} />
        </div>
      </div>
    </>
  );
}

function AdminDashboard({ user }) {
  const { data, loading } = useApi('/dashboard');
  const router = useRouter();
  if (loading || !data) return <LoadingState rows={6} />;

  return (
    <>
      <PageHeader
        title="Operations Dashboard"
        subtitle={`Signed in as ${user.name}`}
        actions={
          <>
            <Link href="/bookings/new" className="btn-primary">
              + New Booking
            </Link>
            <Link href="/reports" className="btn-secondary">
              Reports
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        <StatCard label="Today's Events" value={data.stats.todaysEvents} />
        <StatCard label="Pending Approvals" value={data.stats.pendingApprovals} tone="warning" />
        <StatCard label="Upcoming Events" value={data.stats.upcomingEvents} />
        <StatCard label="Awaiting Closure" value={data.stats.awaitingClosure} tone="warning" />
        <StatCard label="Issues Reported" value={data.stats.issuesReported} tone="danger" />
      </div>

      {user.role === 'master_admin' && data.masterStats && (
        <div className="card p-4 sm:p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-ink-900">Master Admin Controls</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            <StatCard label="Total Bookings" value={data.masterStats.totalBookings} />
            <StatCard label="Active Resources" value={data.masterStats.activeResources} />
            <StatCard label="Active Users" value={data.masterStats.activeUsers} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/users" className="btn-secondary">Manage Users</Link>
            <Link href="/resources" className="btn-secondary">Manage Resources</Link>
            <Link href="/settings" className="btn-secondary">Settings</Link>
            <Link href="/audit-log" className="btn-secondary">Audit Log</Link>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-ink-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-900">Today&apos;s Events</h2>
            <Link href="/events" className="text-xs text-brand-700 hover:underline">
              View all
            </Link>
          </div>
          {data.todaysEvents.length === 0 ? (
            <EmptyState title="No events today" />
          ) : (
            data.todaysEvents.map((b) => <BookingRow key={b._id} booking={b} />)
          )}
        </div>

        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-ink-900">Pending Approvals</h2>
            <Link href="/approvals" className="text-xs text-brand-700 hover:underline">
              View all
            </Link>
          </div>
          {data.pendingApprovals.length === 0 ? (
            <p className="text-sm text-ink-500">Nothing pending review.</p>
          ) : (
            <div className="space-y-2">
              {data.pendingApprovals.map((b) => (
                <button
                  key={b._id}
                  onClick={() => router.push(`/approvals/${b._id}`)}
                  className="w-full text-left rounded-md border border-ink-200 px-3 py-2.5 hover:border-brand-500 hover:bg-brand-50/30"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-ink-900 truncate">{b.eventName}</p>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="text-xs text-ink-500 mt-0.5">{FLOOR_LABELS[b.floor]} · {formatDate(b.date)}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="card p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-ink-900 mb-4">Floor Utilisation</h2>
          <div className="space-y-4">
            {data.floorUtilisation.map((f) => (
              <UtilisationBar key={f.floor} label={f.name} percent={f.percent} sublabel="today" />
            ))}
          </div>
        </div>
        <div className="card p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-ink-900 mb-4">Resource Utilisation</h2>
          <div className="space-y-4">
            {data.resourceUtilisation.slice(0, 6).map((r) => (
              <UtilisationBar key={r.resourceId} label={`${r.name} · ${FLOOR_LABELS[r.floor]}`} percent={r.percent} sublabel="today" />
            ))}
          </div>
        </div>
      </div>

      {user.role === 'master_admin' && (
        <div className="grid lg:grid-cols-2 gap-5 mt-6">
          <div className="card p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-ink-900 mb-3">Recent Audit Activity</h2>
            <div className="space-y-3">
              {(data.recentAudit || []).map((a) => (
                <div key={a._id} className="text-sm border-b border-ink-50 last:border-0 pb-2.5">
                  <p className="text-ink-800">
                    <span className="font-medium">{a.userName}</span> — {a.action}
                  </p>
                  <p className="text-xs text-ink-400 mt-0.5">{a.entityLabel} · {new Date(a.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-ink-900 mb-3">Booking Status Distribution</h2>
            <div className="space-y-2.5">
              {data.statusDistribution.filter((s) => s.count > 0).map((s) => (
                <div key={s.status} className="flex items-center justify-between text-sm">
                  <StatusBadge status={s.status} />
                  <span className="tabular-nums text-ink-700 font-medium">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) return <LoadingState />;
  return user.role === 'organiser' ? <OrganiserDashboard user={user} /> : <AdminDashboard user={user} />;
}
