import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { generateId } from '../../core/ids';
import type { User } from '../../core/schema';
import { ArrowRight, Sparkles, FlaskConical, Cpu, Zap } from 'lucide-react';
import { JasperLogo } from './Landing';

export default function SignIn() {
  const navigate = useNavigate();
  const { user, setUser, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleDemoLogin = () => {
    const demoUser: User = {
      userId: generateId('user'),
      email: 'demo@jasper.ai',
      name: 'Demo User',
    };
    setUser(demoUser);
    navigate('/dashboard');
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
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-2">Welcome back</h2>
              <p className="text-slate-500 dark:text-slate-400">Sign in to start designing</p>
            </div>
            
            <button
              onClick={handleDemoLogin}
              className="group flex items-center justify-center gap-3 w-full py-3.5 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-full hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg shadow-slate-300/30 dark:shadow-slate-900/30"
            >
              <Sparkles className="w-5 h-5" />
              Continue as Demo User
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
            
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
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
