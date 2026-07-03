import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pzuqilmqlbdatketkedu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_VvHze6GsxTGGULSQK_9nig_qh6SlRQO';

// Custom Storage helper to support toggle between Local and Session storage dynamically
const customStorage = {
  getItem(key: string): string | null {
    const keepLogged = localStorage.getItem('trip_keep_logged') !== 'false';
    if (keepLogged) {
      return localStorage.getItem(key);
    } else {
      return sessionStorage.getItem(key);
    }
  },
  setItem(key: string, value: string): void {
    const keepLogged = localStorage.getItem('trip_keep_logged') !== 'false';
    if (keepLogged) {
      localStorage.setItem(key, value);
    } else {
      sessionStorage.setItem(key, value);
    }
  },
  removeItem(key: string): void {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
};

let supabaseInstance: any = null;
let isConfigured = false;

if (supabaseUrl && supabaseAnonKey && (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://'))) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: customStorage,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
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
