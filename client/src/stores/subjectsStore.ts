import { create } from 'zustand';
import { subjectsService, type Subject } from '../services/subjectsService';

interface SubjectsState {
  subjects: Subject[];
  isLoading: boolean;
  fetchSubjects: () => Promise<void>;
  addSubject: (subject: Omit<Subject, 'id' | '_count'>) => Promise<void>;
  updateSubject: (id: string, subject: Omit<Subject, 'id' | '_count'>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
}

export const useSubjectsStore = create<SubjectsState>((set, get) => ({
  subjects: [],
  isLoading: false,

  fetchSubjects: async () => {
    set({ isLoading: true });
    try {
      const { data } = await subjectsService.getSubjects();
      set({ subjects: data });
    } finally {
      set({ isLoading: false });
    }
  },

  addSubject: async (subject) => {
    const { data } = await subjectsService.createSubject(subject);
    set({ subjects: [data, ...get().subjects] });
  },

  updateSubject: async (id, subject) => {
    await subjectsService.updateSubject(id, subject);
    set({
      subjects: get().subjects.map((s) => (s.id === id ? { ...s, ...subject } : s)),
    });
  },

  deleteSubject: async (id) => {
    await subjectsService.deleteSubject(id);
    set({ subjects: get().subjects.filter((s) => s.id !== id) });
  },
}));
