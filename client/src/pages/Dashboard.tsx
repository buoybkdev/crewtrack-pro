import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { crewApi, assignmentsApi } from '../api';
import { CrewMember, Assignment } from '../types';
import StatCard from '../components/StatCard';

const assignmentStatusConfig: Record<Assignment['status'], { label: string; classes: string }> = {
  scheduled: { label: 'Scheduled', classes: 'bg-blue-100 text-blue-800' },
  active: { label: 'Active', classes: 'bg-emerald-100 text-emerald-800' },
  completed: { label: 'Completed', classes: 'bg-slate-100 text-slate-600' },
  cancelled: { label: 'Cancelled', classes: 'bg-red-100 text-red-800' },
};

export default function Dashboard() {
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([crewApi.list(), assignmentsApi.list()])
      .then(([c, a]) => { setCrew(c); setAssignments(a); })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20 text-slate-400 text-lg">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-20">{error}</div>;

  const active = assignments.filter((a) => a.status === 'active').length;
  const onLeave = crew.filter((c) => c.status === 'on_leave').length;
  const unassigned = crew.filter((c) => c.status === 'unassigned').length;
  const recent = [...assignments].sort((a, b) => b.startDate.localeCompare(a.startDate)).slice(0, 5);
  const crewMap = Object.fromEntries(crew.map((c) => [c.id, c]));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your crew operations</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard title="Total Crew" value={crew.length} icon="👥" color="bg-navy-100" />
        <StatCard title="Active Assignments" value={active} icon="🚢" color="bg-emerald-100" />
        <StatCard title="On Leave" value={onLeave} icon="🏖️" color="bg-amber-100" />
        <StatCard title="Unassigned" value={unassigned} icon="⏳" color="bg-blue-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Recent Assignments</h2>
          {recent.length === 0 ? (
            <p className="text-slate-400 text-sm">No assignments yet.</p>
          ) : (
            <div className="space-y-3">
              {recent.map((a) => {
                const member = crewMap[a.crewMemberId];
                const cfg = assignmentStatusConfig[a.status];
                return (
                  <div key={a.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="font-medium text-slate-800">{a.vesselName}</p>
                      <p className="text-sm text-slate-500">{member?.name ?? 'Unknown'} · {new Date(a.startDate).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.classes}`}>{cfg.label}</span>
                  </div>
                );
              })}
            </div>
          )}
          <Link to="/assignments" className="mt-4 block text-sm text-navy-600 hover:text-navy-800 font-medium">
            View all assignments →
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Crew Status Breakdown</h2>
          {(['active', 'on_leave', 'unassigned', 'inactive'] as const).map((status) => {
            const count = crew.filter((c) => c.status === status).length;
            const pct = crew.length > 0 ? Math.round((count / crew.length) * 100) : 0;
            const colors: Record<string, string> = {
              active: 'bg-emerald-500',
              on_leave: 'bg-amber-500',
              unassigned: 'bg-blue-400',
              inactive: 'bg-slate-400',
            };
            const labels: Record<string, string> = {
              active: 'Active',
              on_leave: 'On Leave',
              unassigned: 'Unassigned',
              inactive: 'Inactive',
            };
            return (
              <div key={status} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600 font-medium">{labels[status]}</span>
                  <span className="text-slate-500">{count} ({pct}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className={`${colors[status]} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          <Link to="/crew" className="mt-4 block text-sm text-navy-600 hover:text-navy-800 font-medium">
            Manage crew →
          </Link>
        </div>
      </div>
    </div>
  );
}
