export interface CrewMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  status: 'active' | 'on_leave' | 'unassigned' | 'inactive';
  joinDate: string;
  notes?: string;
}

export interface Assignment {
  id: string;
  crewMemberId: string;
  vesselName: string;
  startDate: string;
  endDate: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Database {
  crew: CrewMember[];
  assignments: Assignment[];
}
