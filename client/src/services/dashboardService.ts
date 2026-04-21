import api from './api';
import type { Assignment } from './assignmentsService';
import type { Todo } from './todosService';

export interface DashboardSummary {
  today: {
    assignments: Assignment[];
    todos: Todo[];
  };
  weekAssignments: Assignment[];
  subjectStats: {
    id: string;
    name: string;
    color: string;
    icon?: string;
    pending: number;
    total: number;
    progress: number;
  }[];
  stats: {
    pending: number;
    overdue: number;
    completedThisWeek: number;
  };
}

export const dashboardService = {
  getSummary: () => api.get<DashboardSummary>('/dashboard/summary'),
};
