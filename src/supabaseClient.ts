import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pzuqilmqlbdatketkedu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_VvHze6GsxTGGULSQK_9nig_qh6SlRQO';

let supabaseInstance: any = null;
let isConfigured = false;

if (supabaseUrl && supabaseAnonKey && (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'))) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    isConfigured = true;
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
  }
}

if (!isConfigured) {
  console.warn(
    'Supabase configuration is invalid or missing! Falling back to local offline mock data mode.'
  );
  // Create a placeholder client to prevent runtime reference crashes
  supabaseInstance = createClient('https://placeholder.supabase.co', 'placeholder-key');
}

export const supabase = supabaseInstance;
export const isSupabaseConfigured = isConfigured;
