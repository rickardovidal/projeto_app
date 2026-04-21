import api from './api';

export type DocType = 'RICH_TEXT' | 'LATEX';

export interface Document {
  id: string;
  title: string;
  type: DocType;
  content: string;
  assignmentId?: string | null;
  assignment?: {
    id: string;
    title: string;
  };
  updatedAt: string;
}

export const documentsService = {
  getDocuments: () => api.get<Document[]>('/documents'),
  createDocument: (data: { title: string; type: DocType; assignmentId?: string | null; content?: string }) => 
    api.post<Document>('/documents', data),
  updateDocument: (id: string, data: Partial<Document>) => 
    api.put(`/documents/${id}`, data),
  deleteDocument: (id: string) => api.delete(`/documents/${id}`),
};
