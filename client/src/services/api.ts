import axios from 'axios';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

let accessToken: string | null = null;
let bootstrapSessionPromise: Promise<void> | null = null;

export const setApiSession = (session: Session | null) => {
  accessToken = session?.access_token ?? null;

  if (accessToken) {
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    return;
  }

  delete api.defaults.headers.common.Authorization;
};

const ensureApiSession = async () => {
  if (!supabase || accessToken || bootstrapSessionPromise) {
    if (bootstrapSessionPromise) {
      await bootstrapSessionPromise;
    }
    return;
  }

  bootstrapSessionPromise = supabase.auth
    .getSession()
    .then(({ data: { session } }) => {
      setApiSession(session);
    })
    .catch((error) => {
      console.error('Failed to bootstrap Supabase session for API:', error);
      setApiSession(null);
    })
    .finally(() => {
      bootstrapSessionPromise = null;
    });

  await bootstrapSessionPromise;
};

api.interceptors.request.use(async (config) => {
  if (!supabase) {
    return config;
  }

  await ensureApiSession();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  
  return config;
});

export default api;
