import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nltvikmgybhunpcdhrge.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sdHZpa21neWJodW5wY2RocmdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNTkwODUsImV4cCI6MjA4MzkzNTA4NX0.YXuRD25ONz894hASuWzHRUBeq52uqy4v1SuBtcIFhlc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
