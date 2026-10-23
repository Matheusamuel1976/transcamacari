import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let client = null;
let configurationError = '';
try {
  if (!supabaseUrl || !supabaseAnonKey) throw new Error('missing configuration');
  client = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  });
} catch {
  configurationError = 'A conexão com o Supabase não está configurada. Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY e gere uma nova versão.';
}
export const supabase = client;
export { configurationError };

export { supabaseUrl, supabaseAnonKey };
