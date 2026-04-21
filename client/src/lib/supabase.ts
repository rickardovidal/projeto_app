import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Só inicializa se as variáveis existirem e parecerem URLs válidas
// Caso contrário, exporta um objeto "mock" ou null para não crashar o app
export const supabase: SupabaseClient | null = (supabaseUrl && supabaseUrl.startsWith('http'))
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.warn('Supabase não configurado. A UI irá carregar mas o login não funcionará.');
}
