import { create } from 'zustand';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, type Profile } from '../lib/supabase';

export interface AppUser {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  subscriptionTier: 'free' | 'pro';
  stripeCustomerId: string | null;
  // For backward compatibility
  userId: string;
}

interface AuthState {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;

  // Actions
  setSession: (session: Session | null) => Promise<void>;
  setUser: (user: AppUser | null) => void;
  signOut: () => Promise<void>;
  loadProfile: () => Promise<void>;
  isProUser: () => boolean;
}

// Convert Supabase user + profile to AppUser
function toAppUser(supabaseUser: SupabaseUser, profile?: Profile | null): AppUser {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || profile?.email || null,
    name: profile?.name || supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || null,
    avatarUrl: profile?.avatar_url || supabaseUser.user_metadata?.avatar_url || null,
    subscriptionTier: profile?.subscription_tier || 'free',
    stripeCustomerId: profile?.stripe_customer_id || null,
    // Backward compatibility
    userId: supabaseUser.id,
  };
}

// Create initial demo user so app works without sign-in
const initialDemoUser: AppUser = {
  id: `demo_${Date.now()}`,
  email: 'demo@jasper.bio',
  name: 'Demo User',
  avatarUrl: null,
  subscriptionTier: 'free',
  stripeCustomerId: null,
  userId: `demo_${Date.now()}`,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialDemoUser,
  session: null,
  loading: false,
  initialized: true,

  setSession: async (session) => {
    try {
      if (session?.user && supabase) {
        // Fetch or create profile
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        // If no profile exists, create one
        if (!profile && error?.code === 'PGRST116') {
          const newProfile: Partial<Profile> = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
            avatar_url: session.user.user_metadata?.avatar_url || null,
            subscription_tier: 'free',
          };

          await supabase.from('profiles').insert(newProfile);
        }

        const appUser = toAppUser(session.user, profile);
        set({ session, user: appUser, loading: false, initialized: true });
      } else {
        // No session - use demo user
        set({ session: null, user: initialDemoUser, loading: false, initialized: true });
      }
    } catch (err) {
      console.error('Error setting session:', err);
      // Still mark as initialized so the app doesn't hang - use demo user
      set({ session: null, user: initialDemoUser, loading: false, initialized: true });
    }
  },

  setUser: (user) => {
    set({ user });
  },

  signOut: async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    // Go back to demo user after sign out
    set({ session: null, user: initialDemoUser });
  },

  loadProfile: async () => {
    const { session } = get();
    if (!session?.user || !supabase) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profile) {
      const appUser = toAppUser(session.user, profile);
      set({ user: appUser });
    }
  },

  isProUser: () => {
    const { user } = get();
    return user?.subscriptionTier === 'pro';
  },
}));

// Demo user support for offline/local mode
export function createDemoUser(): AppUser {
  const demoId = `demo_${Date.now()}`;
  return {
    id: demoId,
    email: 'demo@jasper.bio',
    name: 'Demo User',
    avatarUrl: null,
    subscriptionTier: 'free',
    stripeCustomerId: null,
    userId: demoId,
  };
}
