import api from './api';
import type { Subject } from './subjectsService';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type Status = 'PENDING' | 'IN_PROGRESS' | 'DONE';

export interface Assignment {
  id: string;
  title: string;
  description?: string | null;
  deadline?: string | null;
  priority: Priority;
  status: Status;
  subjectId: string;
  subject: Subject;
  gcalEventId?: string | null;
  notifyBefore?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentFilters {
  subjectId?: string;
  status?: Status;
  priority?: Priority;
  search?: string;
}

export interface AssignmentMutation {
  title: string;
  description?: string | null;
  subjectId: string;
  deadline?: string | null;
  priority: Priority;
  status?: Status;
  notifyBefore?: number | null;
  addToCalendar?: boolean;
}

export const assignmentsService = {
  getAssignments: (filters: AssignmentFilters) => 
    api.get<Assignment[]>('/assignments', { params: filters }),
  createAssignment: (data: AssignmentMutation) => api.post<Assignment>('/assignments', data),
  updateAssignment: (id: string, data: AssignmentMutation) => api.put<Assignment>(`/assignments/${id}`, data),
  updateStatus: (id: string, status: Status) => api.patch(`/assignments/${id}/status`, { status }),
  deleteAssignment: (id: string) => api.delete(`/assignments/${id}`),
};
