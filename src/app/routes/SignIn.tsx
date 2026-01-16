import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore, createDemoUser } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { ArrowRight, FlaskConical, Cpu, Zap, Cloud, HardDrive, Mail, Lock, AlertCircle } from 'lucide-react';
import { JasperLogo } from './Landing';

export default function SignIn() {
  const navigate = useNavigate();
  const { user, session, setUser } = useAuthStore();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Only redirect if user has a real session (not demo user)
    if (session && user && !user.id.startsWith('demo_')) {
      navigate('/dashboard');
    }
  }, [user, session, navigate]);

  const handleDemoLogin = () => {
    const demoUser = createDemoUser();
    setUser(demoUser);
    navigate('/dashboard');
  };

  const handleGoogleSignIn = async () => {
    if (!supabase) {
      setError('Authentication is not configured. Please use demo mode.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Use jaspertech.org for production, current origin for development
      const redirectUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? `${window.location.origin}/dashboard`
        : 'https://jaspertech.org/dashboard';

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
      // Note: User will be redirected to Google, then back to jaspertech.org/dashboard
      // The AuthProvider will handle the session from the URL hash
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError('Authentication is not configured. Please use demo mode.');
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        setMessage('Check your email for a confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate('/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-50 dark:bg-slate-800/50 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 dark:bg-teal-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16">
          <Link to="/" className="flex items-center gap-3 mb-10">
            <JasperLogo className="w-10 h-10 text-slate-800 dark:text-white" />
            <div>
              <h1 className="text-2xl font-semibold text-slate-800 dark:text-white tracking-tight">Jasper</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Process Design IDE</p>
            </div>
          </Link>

          <h2 className="text-4xl font-light text-slate-800 dark:text-white leading-tight mb-6">
            Design chemical processes<br />
            <span className="text-teal-600 dark:text-teal-400 font-normal">with confidence</span>
          </h2>

          <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 max-w-md">
            A modern IDE for process engineers. Build flowsheets, run simulations,
            and optimize your designs—all in one place.
          </p>

          {/* Feature highlights */}
          <div className="space-y-4">
            {[
              { icon: FlaskConical, text: 'Visual flowsheet editor' },
              { icon: Cpu, text: 'Built-in simulation engine' },
              { icon: Zap, text: 'Real-time optimization' },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <feature.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Sign in */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden flex items-center justify-center gap-3 mb-12">
            <JasperLogo className="w-10 h-10 text-slate-800 dark:text-white" />
            <span className="text-2xl font-semibold text-slate-800 dark:text-white">Jasper</span>
          </Link>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 border border-slate-100 dark:border-slate-700/50">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-2">
                {mode === 'signin' ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                {mode === 'signin' ? 'Sign in to start designing' : 'Sign up to get started'}
              </p>
            </div>

            {/* Error/Message display */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-xl flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            {message && (
              <div className="mb-4 p-3 bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/30 rounded-xl text-sm text-teal-600 dark:text-teal-400">
                {message}
              </div>
            )}

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-slate-50 dark:bg-slate-800/50 text-slate-400">or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-teal-500 text-white font-medium rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            </form>

            {/* Toggle mode */}
            <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
              {mode === 'signin' ? (
                <>
                  Don't have an account?{' '}
                  <button onClick={() => setMode('signup')} className="text-teal-600 dark:text-teal-400 font-medium hover:underline">
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button onClick={() => setMode('signin')} className="text-teal-600 dark:text-teal-400 font-medium hover:underline">
                    Sign in
                  </button>
                </>
              )}
            </p>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-slate-50 dark:bg-slate-800/50 text-slate-400">or</span>
              </div>
            </div>

            {/* Demo Mode */}
            <button
              onClick={handleDemoLogin}
              className="group flex items-center justify-center gap-3 w-full py-3 px-6 bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              <HardDrive className="w-4 h-4" />
              Continue as Demo User
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-2 flex items-center justify-center gap-1.5">
              <HardDrive className="w-3 h-3" />
              Local storage only • 2 project limit
            </p>
          </div>

          {/* Pro benefits hint */}
          <div className="mt-6 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-2xl border border-teal-100 dark:border-teal-800/30">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-800/50 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-teal-800 dark:text-teal-300">Unlock cloud features</p>
                <p className="text-xs text-teal-600 dark:text-teal-400 mt-0.5">
                  Sign in to sync projects across devices and collaborate with your team.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-8">
            <Link to="/" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
