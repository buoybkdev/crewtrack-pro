import { useEffect, useState, useCallback } from 'react';
import { crewApi } from '../api';
import { CrewMember, CREW_ROLES, CREW_STATUSES } from '../types';
import CrewMemberCard from '../components/CrewMemberCard';
import Modal from '../components/Modal';

type FormData = Omit<CrewMember, 'id'>;

const emptyForm: FormData = {
  name: '',
  role: 'Captain',
  email: '',
  phone: '',
  status: 'unassigned',
  joinDate: new Date().toISOString().split('T')[0],
  notes: '',
};

interface Toast { message: string; type: 'success' | 'error'; }

const statusLabels: Record<CrewMember['status'], string> = {
  active: 'Active',
  on_leave: 'On Leave',
  unassigned: 'Unassigned',
  inactive: 'Inactive',
};

export default function CrewMembers() {
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterSearch, setFilterSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CrewMember | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadCrew = useCallback(async () => {
    setLoading(true);
    try {
      const data = await crewApi.list();
      setCrew(data);
    } catch (e) {
      showToast((e as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCrew(); }, [loadCrew]);

  const openCreate = () => {
    setEditingMember(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (member: CrewMember) => {
    setEditingMember(member);
    setForm({ name: member.name, role: member.role, email: member.email, phone: member.phone, status: member.status, joinDate: member.joinDate, notes: member.notes ?? '' });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this crew member?')) return;
    try {
      await crewApi.delete(id);
      setCrew((prev) => prev.filter((c) => c.id !== id));
      showToast('Crew member deleted', 'success');
    } catch (e) {
      showToast((e as Error).message, 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingMember) {
        const updated = await crewApi.update(editingMember.id, form);
        setCrew((prev) => prev.map((c) => (c.id === editingMember.id ? updated : c)));
        showToast('Crew member updated', 'success');
      } else {
        const created = await crewApi.create(form);
        setCrew((prev) => [...prev, created]);
        showToast('Crew member added', 'success');
      }
      setModalOpen(false);
    } catch (e) {
      showToast((e as Error).message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = crew.filter((c) => {
    const matchStatus = !filterStatus || c.status === filterStatus;
    const matchSearch = !filterSearch || c.name.toLowerCase().includes(filterSearch.toLowerCase()) || c.role.toLowerCase().includes(filterSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg font-medium text-sm ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Crew Members</h1>
          <p className="text-slate-500 mt-1">{crew.length} total members</p>
        </div>
        <button onClick={openCreate} className="bg-navy-700 hover:bg-navy-800 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
          + Add Crew Member
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or role..."
          value={filterSearch}
          onChange={(e) => setFilterSearch(e.target.value)}
          className="flex-1 border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-white"
        >
          <option value="">All Statuses</option>
          {CREW_STATUSES.map((s) => (
            <option key={s} value={s}>{statusLabels[s]}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading crew members...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">👥</p>
          <p className="text-slate-500 text-lg font-medium">No crew members found</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or add a new crew member</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((member) => (
            <CrewMemberCard key={member.id} member={member} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingMember ? 'Edit Crew Member' : 'Add Crew Member'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400" placeholder="John Smith" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
              <select required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy-400">
                {CREW_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as CrewMember['status'] })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy-400">
                {CREW_STATUSES.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400" placeholder="john@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400" placeholder="+1-555-0100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Join Date</label>
            <input type="date" value={form.joinDate} onChange={(e) => setForm({ ...form, joinDate: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 resize-none" placeholder="Optional notes..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-navy-700 hover:bg-navy-800 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
              {submitting ? 'Saving...' : editingMember ? 'Update' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
