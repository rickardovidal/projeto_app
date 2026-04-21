import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Prevent crash if env vars are missing
export const supabase = (supabaseUrl && supabaseUrl.startsWith('http')) 
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null as any;

if (!supabase) {
  console.warn('Backend: Supabase URL missing or invalid. Auth middleware will fail.');
}
