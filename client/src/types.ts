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

export type CrewStatus = CrewMember['status'];
export type AssignmentStatus = Assignment['status'];

export const CREW_ROLES = ['Captain', 'First Officer', 'Engineer', 'Deckhand', 'Cook', 'Navigator', 'Medic', 'Mate'] as const;
export const CREW_STATUSES: CrewStatus[] = ['active', 'on_leave', 'unassigned', 'inactive'];
export const ASSIGNMENT_STATUSES: AssignmentStatus[] = ['scheduled', 'active', 'completed', 'cancelled'];
