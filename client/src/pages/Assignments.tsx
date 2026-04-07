import { useEffect, useState, useCallback } from 'react';
import { assignmentsApi, crewApi } from '../api';
import { Assignment, CrewMember, ASSIGNMENT_STATUSES } from '../types';
import Modal from '../components/Modal';

type FormData = Omit<Assignment, 'id'>;

const emptyForm: FormData = {
  crewMemberId: '',
  vesselName: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  status: 'scheduled',
  notes: '',
};

interface Toast { message: string; type: 'success' | 'error'; }

const statusConfig: Record<Assignment['status'], { label: string; classes: string }> = {
  scheduled: { label: 'Scheduled', classes: 'bg-blue-100 text-blue-800' },
  active: { label: 'Active', classes: 'bg-emerald-100 text-emerald-800' },
  completed: { label: 'Completed', classes: 'bg-slate-100 text-slate-600' },
  cancelled: { label: 'Cancelled', classes: 'bg-red-100 text-red-800' },
};

export default function Assignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterSearch, setFilterSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [a, c] = await Promise.all([assignmentsApi.list(), crewApi.list()]);
      setAssignments(a);
      setCrew(c);
    } catch (e) {
      showToast((e as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openCreate = () => {
    setEditingAssignment(null);
    setForm({ ...emptyForm, crewMemberId: crew[0]?.id ?? '' });
    setModalOpen(true);
  };

  const openEdit = (a: Assignment) => {
    setEditingAssignment(a);
    setForm({ crewMemberId: a.crewMemberId, vesselName: a.vesselName, startDate: a.startDate, endDate: a.endDate, status: a.status, notes: a.notes ?? '' });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assignment?')) return;
    try {
      await assignmentsApi.delete(id);
      setAssignments((prev) => prev.filter((a) => a.id !== id));
      showToast('Assignment deleted', 'success');
    } catch (e) {
      showToast((e as Error).message, 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingAssignment) {
        const updated = await assignmentsApi.update(editingAssignment.id, form);
        setAssignments((prev) => prev.map((a) => (a.id === editingAssignment.id ? updated : a)));
        showToast('Assignment updated', 'success');
      } else {
        const created = await assignmentsApi.create(form);
        setAssignments((prev) => [...prev, created]);
        showToast('Assignment created', 'success');
      }
      setModalOpen(false);
    } catch (e) {
      showToast((e as Error).message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const crewMap = Object.fromEntries(crew.map((c) => [c.id, c]));

  const filtered = assignments.filter((a) => {
    const matchStatus = !filterStatus || a.status === filterStatus;
    const member = crewMap[a.crewMemberId];
    const matchSearch = !filterSearch ||
      a.vesselName.toLowerCase().includes(filterSearch.toLowerCase()) ||
      (member?.name ?? '').toLowerCase().includes(filterSearch.toLowerCase());
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
          <h1 className="text-3xl font-bold text-slate-800">Assignments</h1>
          <p className="text-slate-500 mt-1">{assignments.length} total assignments</p>
        </div>
        <button onClick={openCreate} className="bg-navy-700 hover:bg-navy-800 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
          + New Assignment
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by vessel or crew name..."
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
          {ASSIGNMENT_STATUSES.map((s) => (
            <option key={s} value={s}>{statusConfig[s].label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading assignments...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🚢</p>
          <p className="text-slate-500 text-lg font-medium">No assignments found</p>
          <p className="text-slate-400 text-sm mt-1">Create a new assignment to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Vessel', 'Crew Member', 'Role', 'Start Date', 'End Date', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((a) => {
                const member = crewMap[a.crewMemberId];
                const cfg = statusConfig[a.status];
                return (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{a.vesselName}</td>
                    <td className="px-4 py-3 text-slate-600">{member?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-500">{member?.role ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(a.startDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-slate-600">{new Date(a.endDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.classes}`}>{cfg.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(a)} className="text-navy-600 hover:text-navy-800 font-medium">Edit</button>
                        <button onClick={() => handleDelete(a.id)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingAssignment ? 'Edit Assignment' : 'New Assignment'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Crew Member *</label>
            <select required value={form.crewMemberId} onChange={(e) => setForm({ ...form, crewMemberId: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy-400">
              <option value="">Select crew member...</option>
              {crew.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.role})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vessel Name *</label>
            <input required value={form.vesselName} onChange={(e) => setForm({ ...form, vesselName: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400" placeholder="MV Example" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date *</label>
              <input required type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Date *</label>
              <input required type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Assignment['status'] })} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy-400">
              {ASSIGNMENT_STATUSES.map((s) => <option key={s} value={s}>{statusConfig[s].label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 resize-none" placeholder="Optional notes..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-navy-700 hover:bg-navy-800 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
              {submitting ? 'Saving...' : editingAssignment ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
