import { useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setSession } = useAuthStore();

  useEffect(() => {
    // Try to get existing session (for logged-in users)
    // This runs in background - app works immediately with demo user
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session) {
          setSession(session);
        }
      })
      .catch((err) => {
        console.error('Failed to get session:', err);
        // App continues with demo user
      });

    // Listen for auth changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession]);

  // Always render children immediately - no loading state
  // App starts with demo user, upgrades to real user if session exists
  return <>{children}</>;
}
