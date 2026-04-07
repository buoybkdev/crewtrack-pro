import { CrewMember } from '../types';

interface CrewMemberCardProps {
  member: CrewMember;
  onEdit: (member: CrewMember) => void;
  onDelete: (id: string) => void;
}

const statusConfig: Record<CrewMember['status'], { label: string; classes: string }> = {
  active: { label: 'Active', classes: 'bg-emerald-100 text-emerald-800' },
  on_leave: { label: 'On Leave', classes: 'bg-amber-100 text-amber-800' },
  unassigned: { label: 'Unassigned', classes: 'bg-blue-100 text-blue-800' },
  inactive: { label: 'Inactive', classes: 'bg-slate-100 text-slate-600' },
};

export default function CrewMemberCard({ member, onEdit, onDelete }: CrewMemberCardProps) {
  const status = statusConfig[member.status];
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-800 text-lg">{member.name}</h3>
          <p className="text-navy-600 font-medium text-sm">{member.role}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.classes}`}>
          {status.label}
        </span>
      </div>
      <div className="space-y-1 text-sm text-slate-600 mb-4">
        <p>📧 {member.email}</p>
        <p>📞 {member.phone}</p>
        <p>📅 Joined {new Date(member.joinDate).toLocaleDateString()}</p>
        {member.notes && <p className="italic text-slate-400 truncate" title={member.notes}>💬 {member.notes}</p>}
      </div>
      <div className="flex gap-2 pt-3 border-t border-slate-100">
        <button
          onClick={() => onEdit(member)}
          className="flex-1 py-1.5 text-sm font-medium text-navy-600 border border-navy-300 rounded-lg hover:bg-navy-50 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(member.id)}
          className="flex-1 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
