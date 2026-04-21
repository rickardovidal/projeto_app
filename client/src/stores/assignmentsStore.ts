import { create } from 'zustand';
import {
  assignmentsService,
  type Assignment,
  type AssignmentFilters,
  type AssignmentMutation,
  type Status,
} from '../services/assignmentsService';

interface AssignmentsState {
  assignments: Assignment[];
  isLoading: boolean;
  filters: AssignmentFilters;
  fetchAssignments: () => Promise<void>;
  setFilters: (filters: Partial<AssignmentFilters>) => void;
  addAssignment: (data: AssignmentMutation) => Promise<void>;
  updateAssignment: (id: string, data: AssignmentMutation) => Promise<void>;
  updateStatus: (id: string, status: Status) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
}

export const useAssignmentsStore = create<AssignmentsState>((set, get) => ({
  assignments: [],
  isLoading: false,
  filters: {
    search: '',
  },

  fetchAssignments: async () => {
    set({ isLoading: true });
    try {
      const { data } = await assignmentsService.getAssignments(get().filters);
      set({ assignments: data });
    } finally {
      set({ isLoading: false });
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({ 
      filters: { ...state.filters, ...newFilters } 
    }));
    get().fetchAssignments();
  },

  addAssignment: async (data) => {
    const { data: newAssignment } = await assignmentsService.createAssignment(data);
    set({ assignments: [newAssignment, ...get().assignments] });
  },

  updateAssignment: async (id, data) => {
    const { data: updated } = await assignmentsService.updateAssignment(id, data);
    set({
      assignments: get().assignments.map((a) => (a.id === id ? { ...a, ...updated } : a)),
    });
  },

  updateStatus: async (id, status) => {
    await assignmentsService.updateStatus(id, status);
    set({
      assignments: get().assignments.map((a) => (a.id === id ? { ...a, status } : a)),
    });
  },

  deleteAssignment: async (id) => {
    await assignmentsService.deleteAssignment(id);
    set({ assignments: get().assignments.filter((a) => a.id !== id) });
  },
}));
