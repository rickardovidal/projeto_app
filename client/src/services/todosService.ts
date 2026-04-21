import api from './api';
import type { Priority } from './assignmentsService';

export interface Todo {
  id: string;
  title: string;
  description?: string | null;
  deadline?: string | null;
  priority: Priority;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TodoMutation {
  title: string;
  description?: string | null;
  deadline?: string | null;
  priority: Priority;
}

export const todosService = {
  getTodos: () => api.get<Todo[]>('/todos'),
  createTodo: (data: TodoMutation) => api.post<Todo>('/todos', data),
  updateTodo: (id: string, data: TodoMutation) => api.put<Todo>(`/todos/${id}`, data),
  toggleTodo: (id: string) => api.patch<Todo>(`/todos/${id}/toggle`),
  deleteTodo: (id: string) => api.delete(`/todos/${id}`),
};
