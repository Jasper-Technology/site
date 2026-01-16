import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase is optional - app works in demo mode without it
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Database types
export type Profile = {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  subscription_tier: 'free' | 'pro';
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
};

export type DbProject = {
  id: string;
  user_id: string;
  org_id: string | null;
  name: string;
  data: Record<string, unknown>;
  status: string;
  created_at: string;
  updated_at: string;
};
