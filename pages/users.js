import { useState } from 'react';
import { useApi } from '@/lib/useApi';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
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

function UserModal({ open, onClose, user, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState(
    user || { userId: '', name: '', email: '', mobile: '', role: 'organiser', department: '', active: true }
  );
  const [submitting, setSubmitting] = useState(false);

  function update(patch) {
    setForm((f) => ({ ...f, ...patch }));
  }

  async function submit() {
    setSubmitting(true);
    try {
      if (user) await api.put(`/users/${user._id}`, form);
      else await api.post('/users', form);
      toast(user ? 'User updated.' : 'User created.', 'success');
      onSaved();
      onClose();
    } catch (err) {
      toast(err.message || 'Unable to save user.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={user ? 'Edit User' : 'Add User'}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={!form.name || !form.userId || !form.email || submitting}>
            {submitting ? 'Saving…' : 'Save'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">User ID</label>
            <input className="field-input" value={form.userId} disabled={!!user} onChange={(e) => update({ userId: e.target.value })} />
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
        {user && (
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input type="checkbox" checked={form.active} onChange={(e) => update({ active: e.target.checked })} />
            Active
          </label>
        )}
      </div>
    </Modal>
  );
}

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [modalUser, setModalUser] = useState(undefined); // undefined = closed, null = new, object = edit

  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (role) params.set('role', role);
  const { data: users, loading, refetch } = useApi(`/users?${params.toString()}`, [search, role]);

  const columns = [
    { key: 'name', label: 'Name', render: (u) => <span className="font-medium text-ink-900">{u.name}</span> },
    { key: 'userId', label: 'User ID' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (u) => ROLE_LABELS[u.role] },
    { key: 'department', label: 'Department' },
    { key: 'status', label: 'Status', render: (u) => (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${u.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-ink-100 text-ink-500 border-ink-200'}`}>
        {u.active ? 'Active' : 'Disabled'}
      </span>
    ) },
    { key: 'actions', label: '', render: (u) => (
      <button className="text-xs text-brand-700 hover:underline" onClick={(e) => { e.stopPropagation(); setModalUser(u); }}>Edit</button>
    ) },
  ];

  return (
    <>
      <PageHeader title="Users" subtitle="Authorised users of the booking system." actions={<button className="btn-primary" onClick={() => setModalUser(null)}>+ Add User</button>} />
      <div className="card p-4 sm:p-5">
        <FilterBar>
          <SearchInput value={search} onChange={setSearch} placeholder="Search users…" className="w-full sm:w-64" />
          <Select value={role} onChange={setRole} ariaLabel="Role" options={ROLE_OPTIONS} />
        </FilterBar>
        <DataTable columns={columns} rows={users} loading={loading} emptyTitle="No users found" />
      </div>

      {modalUser !== undefined && (
        <UserModal open user={modalUser} onClose={() => setModalUser(undefined)} onSaved={refetch} />
      )}
    </>
  );
}
