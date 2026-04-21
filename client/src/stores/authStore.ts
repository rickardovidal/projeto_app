import { create } from 'zustand';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import api, { setApiSession } from '../services/api';

interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

let initializePromise: Promise<void> | null = null;
let authSubscription: { unsubscribe: () => void } | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  initialized: false,

  setUser: (user) => set({ user, isLoading: false }),

  signInWithGoogle: async () => {
    if (!supabase) return alert('Supabase não configurado');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  },

  signOut: async () => {
    if (supabase) await supabase.auth.signOut();
    setApiSession(null);
    set({ user: null });
  },

  initialize: async () => {
    if (get().initialized) {
      return;
    }

    if (initializePromise) {
      await initializePromise;
      return;
    }

    initializePromise = (async () => {
    if (!supabase) {
      set({ user: null, initialized: true, isLoading: false });
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      setApiSession(session);
      
      if (session) {
        try {
          const { data: user } = await api.post('/auth/verify');
          set({ user, initialized: true, isLoading: false });
        } catch (error) {
          console.error('Auth verify request failed during initialization:', error);
          setApiSession(null);
          set({ user: null, initialized: true, isLoading: false });
        }
      } else {
        set({ user: null, initialized: true, isLoading: false });
      }

      if (!authSubscription) {
        const { data } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
          setApiSession(session);

          try {
            if (event === 'SIGNED_IN' && session) {
              const { data: user } = await api.post('/auth/verify');
              set({ user, initialized: true, isLoading: false });
            } else if (event === 'SIGNED_OUT') {
              set({ user: null, initialized: true, isLoading: false });
            }
          } catch (error) {
            console.error('Auth verify request failed on auth state change:', error);
            setApiSession(null);
            set({ user: null, initialized: true, isLoading: false });
          }
        });

        authSubscription = data.subscription;
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setApiSession(null);
      set({ user: null, initialized: true, isLoading: false });
    }
    })();

    try {
      await initializePromise;
    } finally {
      initializePromise = null;
    }
  },
}));
