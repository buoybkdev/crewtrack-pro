import { CrewMember, Assignment } from './types';

const BASE_URL = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const crewApi = {
  list: (status?: string) =>
    request<CrewMember[]>(`/crew${status ? `?status=${status}` : ''}`),
  create: (data: Omit<CrewMember, 'id'>) =>
    request<CrewMember>('/crew', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CrewMember>) =>
    request<CrewMember>(`/crew/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/crew/${id}`, { method: 'DELETE' }),
};

export const assignmentsApi = {
  list: (crewId?: string) =>
    request<Assignment[]>(`/assignments${crewId ? `?crewId=${crewId}` : ''}`),
  create: (data: Omit<Assignment, 'id'>) =>
    request<Assignment>('/assignments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Assignment>) =>
    request<Assignment>(`/assignments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/assignments/${id}`, { method: 'DELETE' }),
};
