import api from './api';

export interface Subject {
  id: string;
  name: string;
  color: string;
  icon?: string;
  _count?: {
    assignments: number;
  };
}

export const subjectsService = {
  getSubjects: () => api.get<Subject[]>('/subjects'),
  createSubject: (data: Omit<Subject, 'id' | '_count'>) => api.post<Subject>('/subjects', data),
  updateSubject: (id: string, data: Omit<Subject, 'id' | '_count'>) => api.put<Subject>(`/subjects/${id}`, data),
  deleteSubject: (id: string) => api.delete(`/subjects/${id}`),
};
