import { useState } from 'react';
import { useApi } from '@/lib/useApi';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import { SearchInput } from '@/components/ui/FilterBar';
import Modal from '@/components/ui/Modal';

function ContactModal({ open, onClose, contact, onSaved }) {
  const { toast } = useToast();
  const [form, setForm] = useState(contact || { name: '', role: '', phone: '', email: '', active: true });
  const [submitting, setSubmitting] = useState(false);

  function update(patch) {
    setForm((f) => ({ ...f, ...patch }));
  }

  async function submit() {
    setSubmitting(true);
    try {
      if (contact) await api.put(`/contacts/${contact._id}`, form);
      else await api.post('/contacts', form);
      toast(contact ? 'Contact updated.' : 'Contact added.', 'success');
      onSaved();
      onClose();
    } catch (err) {
      toast(err.message || 'Unable to save contact.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={contact ? 'Edit Contact' : 'Add Contact'}
      footer={
        <>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit} disabled={!form.name || submitting}>{submitting ? 'Saving…' : 'Save'}</button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="field-label">Name</label>
          <input className="field-input" value={form.name} onChange={(e) => update({ name: e.target.value })} />
        </div>
        <div>
          <label className="field-label">Role / Department</label>
          <input className="field-input" value={form.role} onChange={(e) => update({ role: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Phone</label>
            <input className="field-input" value={form.phone} onChange={(e) => update({ phone: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Email</label>
            <input type="email" className="field-input" value={form.email} onChange={(e) => update({ email: e.target.value })} />
          </div>
        </div>
        {contact && (
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input type="checkbox" checked={form.active} onChange={(e) => update({ active: e.target.checked })} />
            Active
          </label>
        )}
      </div>
    </Modal>
  );
}

export default function ContactsPage() {
  const [search, setSearch] = useState('');
  const [modalContact, setModalContact] = useState(undefined);
  const { data: contacts, loading, refetch } = useApi(`/contacts?search=${encodeURIComponent(search)}`, [search]);

  const columns = [
    { key: 'name', label: 'Name', render: (c) => <span className="font-medium text-ink-900">{c.name}</span> },
    { key: 'role', label: 'Role / Department' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status', render: (c) => (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${c.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-ink-100 text-ink-500 border-ink-200'}`}>
        {c.active ? 'Active' : 'Inactive'}
      </span>
    ) },
    { key: 'actions', label: '', render: (c) => (
      <button className="text-xs text-brand-700 hover:underline" onClick={(e) => { e.stopPropagation(); setModalContact(c); }}>Edit</button>
    ) },
  ];

  return (
    <>
      <PageHeader title="Arrangement Contacts" subtitle="Facilities and equipment contacts shown on approved bookings." actions={<button className="btn-primary" onClick={() => setModalContact(null)}>+ Add Contact</button>} />
      <div className="card p-4 sm:p-5">
        <SearchInput value={search} onChange={setSearch} placeholder="Search contacts…" className="w-full sm:w-72 mb-4" />
        <DataTable columns={columns} rows={contacts} loading={loading} emptyTitle="No contacts found" />
      </div>
      {modalContact !== undefined && (
        <ContactModal open contact={modalContact} onClose={() => setModalContact(undefined)} onSaved={refetch} />
      )}
    </>
  );
}
