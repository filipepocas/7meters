/**
 * 7meters - Supabase Client Integration
 * Inicialização do cliente Supabase para persistência de dados em cloud
 * (utilizadores, clubes, plantéis, classificações).
 * Se as variáveis de ambiente ainda não estiverem definidas, funciona em modo offline/local.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
