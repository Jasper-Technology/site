import { useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setSession } = useAuthStore();

  useEffect(() => {
    // Handle OAuth callback - check for hash fragments in URL
    const handleAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      
      if (accessToken || refreshToken) {
        // OAuth callback detected - get the session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session && !error) {
          setSession(session);
          // Clean up the URL hash
          window.history.replaceState(null, '', window.location.pathname);
        }
      }
    };

    // Try to get existing session (for logged-in users)
    // This runs in background - app works immediately with demo user
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (session) {
          setSession(session);
        } else {
          // If no session, check for OAuth callback
          handleAuthCallback();
        }
      })
      .catch((err) => {
        console.error('Failed to get session:', err);
        // App continues with demo user
      });

    // Listen for auth changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setSession(session);
        // Clean up URL hash after successful sign-in
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      } else {
        setSession(session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession]);

  // Always render children immediately - no loading state
  // App starts with demo user, upgrades to real user if session exists
  return <>{children}</>;
}
