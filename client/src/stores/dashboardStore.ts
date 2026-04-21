import { create } from 'zustand';
import { dashboardService, type DashboardSummary } from '../services/dashboardService';

interface DashboardState {
  summary: DashboardSummary | null;
  isLoading: boolean;
  fetchSummary: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  summary: null,
  isLoading: false,

  fetchSummary: async () => {
    set({ isLoading: true });
    try {
      const { data } = await dashboardService.getSummary();
      set({ summary: data });
    } finally {
      set({ isLoading: false });
    }
  },
}));
