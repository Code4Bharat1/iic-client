'use client';
import { useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { api } from '@/services/api-client';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import FilterBar, { SearchInput, Select } from '@/components/ui/FilterBar';
import Modal from '@/components/ui/Modal';
import { ROLE_LABELS } from '@/lib/constants';

const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'organiser', label: 'Organiser' },
  { value: 'admin', label: 'Admin' },
  { value: 'master_admin', label: 'Master Admin' },
];

/** Confirmation modal before permanent deletion */
function DeleteConfirmModal({ user, onClose, onDeleted }) {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  async function confirm() {
    setDeleting(true);
    try {
      await api.delete(`/users/${user._id}`);
      toast(`User "${user.name}" deleted.`, 'success');
      onDeleted();
      onClose();
    } catch (err) {
      toast(err.message || 'Failed to delete user.', 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Delete User"
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            style={{ background: '#dc2626' }}
            onClick={confirm}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-red-800">This action is permanent</p>
            <p className="text-sm text-red-700">This will permanently delete the user account. This cannot be undone.</p>
          </div>
        </div>
        <div className="px-1 py-2">
          <p className="text-sm text-ink-600">You are about to delete:</p>
          <p className="font-semibold text-ink-900 mt-1">{user.name} <span className="text-ink-400 font-normal text-sm">({user.userId})</span></p>
          <p className="text-sm text-ink-500">{user.email}</p>
        </div>
      </div>
    </Modal>
  );
}

function UserModal({ open, onClose, user, onSaved, onDeleteClick }) {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const isEdit = !!user;
  const isSelf = isEdit && String(user._id) === String(currentUser?.id);

  const [form, setForm] = useState(
    user
      ? { name: user.name, email: user.email, mobile: user.mobile || '', role: user.role, department: user.department || '', active: user.active }
      : { userId: '', name: '', email: '', mobile: '', role: 'organiser', department: '' }
  );
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  function update(patch) {
    setForm((f) => ({ ...f, ...patch }));
  }

  async function submit() {
    setSubmitting(true);
    try {
      if (isEdit) {
        await api.put(`/users/${user._id}`, form);
        toast('User updated.', 'success');
      } else {
        await api.post('/users', form);
        toast('User created. Login credentials have been sent to their email.', 'success');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast(err.message || 'Unable to save user.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await api.post(`/users/${user._id}/resend-credentials`);
      toast(`New credentials sent to ${user.email}`, 'success');
    } catch (err) {
      toast(err.message || 'Failed to resend credentials.', 'error');
    } finally {
      setResending(false);
    }
  }

  const canSave = isEdit
    ? (form.name && form.email)
    : (form.userId && form.name && form.email);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit User' : 'Add User'}
      footer={
        <div className="flex w-full items-center justify-between gap-2">
          {/* Delete on left (edit only, not self) */}
          <div>
            {isEdit && !isSelf && (
              <button
                className="text-sm text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                onClick={() => { onClose(); onDeleteClick(user); }}
              >
                🗑 Delete User
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={submit} disabled={!canSave || submitting}>
              {submitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {!isEdit && (
          <div className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
            📧 <strong>Auto-credential delivery:</strong> A secure temporary password will be generated and emailed to the user automatically upon saving.
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">User ID</label>
            <input
              className="field-input"
              value={isEdit ? user.userId : form.userId}
              disabled={isEdit}
              onChange={(e) => update({ userId: e.target.value })}
              placeholder="e.g. ORG-1005"
            />
          </div>
          <div>
            <label className="field-label">Role</label>
            <select className="field-input" value={form.role} onChange={(e) => update({ role: e.target.value })}>
              <option value="organiser">Organiser</option>
              <option value="admin">Admin</option>
              <option value="master_admin">Master Admin</option>
            </select>
          </div>
        </div>

        <div>
          <label className="field-label">Name</label>
          <input className="field-input" value={form.name} onChange={(e) => update({ name: e.target.value })} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Email</label>
            <input type="email" className="field-input" value={form.email} onChange={(e) => update({ email: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Mobile</label>
            <input className="field-input" value={form.mobile} onChange={(e) => update({ mobile: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="field-label">Department / Organisation</label>
          <input className="field-input" value={form.department} onChange={(e) => update({ department: e.target.value })} />
        </div>

        {isEdit && (
          <>
            <label className="flex items-center gap-2 text-sm text-ink-700">
              <input type="checkbox" checked={form.active} onChange={(e) => update({ active: e.target.checked })} />
              Active
            </label>

            {/* Resend credentials section */}
            <div className="rounded-lg border border-ink-200 bg-ink-50 px-4 py-3">
              <p className="text-sm font-medium text-ink-700 mb-1">Credentials</p>
              <p className="text-xs text-ink-500 mb-3">
                Reset this user's password and send new login credentials to <strong>{user.email}</strong>.
              </p>
              <button
                type="button"
                className="btn-secondary text-xs px-3 py-1.5"
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? 'Sending…' : '🔁 Resend Credentials'}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [modalUser, setModalUser] = useState(undefined); // undefined=closed, null=new, obj=edit
  const [deleteTarget, setDeleteTarget] = useState(null);

  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (role) params.set('role', role);
  const { data: users, loading, refetch } = useApi(`/users?${params.toString()}`, [search, role]);

  const columns = [
    { key: 'name', label: 'Name', render: (u) => (
      <div>
        <span className="font-medium text-ink-900">{u.name}</span>
        {u.mustChangePassword && (
          <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
            Temp PW
          </span>
        )}
      </div>
    )},
    { key: 'userId', label: 'User ID' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (u) => ROLE_LABELS[u.role] },
    { key: 'department', label: 'Department' },
    { key: 'status', label: 'Status', render: (u) => (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${u.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-ink-100 text-ink-500 border-ink-200'}`}>
        {u.active ? 'Active' : 'Disabled'}
      </span>
    )},
    { key: 'actions', label: '', render: (u) => (
      <button className="text-xs text-brand-700 hover:underline" onClick={(e) => { e.stopPropagation(); setModalUser(u); }}>Edit</button>
    )},
  ];

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="Authorised users of the booking system."
        actions={<button className="btn-primary" onClick={() => setModalUser(null)}>+ Add User</button>}
      />
      <div className="card p-4 sm:p-5">
        <FilterBar>
          <SearchInput value={search} onChange={setSearch} placeholder="Search users…" className="w-full sm:w-64" />
          <Select value={role} onChange={setRole} ariaLabel="Role" options={ROLE_OPTIONS} />
        </FilterBar>
        <DataTable columns={columns} rows={users} loading={loading} emptyTitle="No users found" />
      </div>

      {modalUser !== undefined && (
        <UserModal
          open
          user={modalUser}
          onClose={() => setModalUser(undefined)}
          onSaved={refetch}
          onDeleteClick={(u) => setDeleteTarget(u)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          user={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={refetch}
        />
      )}
    </>
  );
}
