import { useState, useEffect } from 'react';
import { 
  User, 
  LogOut, 
  Home,
  Play,
  Save,
  Loader2,
  ChevronDown,
  Settings,
  FileText,
  Moon,
  Sun
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { JasperLogo } from '../../app/routes/Landing';

interface TopBarProps {
  projectName: string;
  status: string;
  onSaveVersion?: () => void;
  onRunSimulation?: () => void;
  isSimulating?: boolean;
}

// Theme toggle hook
function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('jasper-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('jasper-theme', 'light');
    }
  }, [isDark]);

  return { isDark, toggle: () => setIsDark(!isDark) };
}

export default function TopBar({ 
  projectName, 
  status, 
  onSaveVersion,
  onRunSimulation,
  isSimulating 
}: TopBarProps) {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { isDark, toggle } = useTheme();

  const handleSignOut = () => {
    setUser(null as any);
    navigate('/signin');
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'feasible':
        return { label: 'Feasible', className: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' };
      case 'optimized':
        return { label: 'Optimized', className: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400' };
      case 'failed':
        return { label: 'Failed', className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' };
      case 'sim_ok':
        return { label: 'Simulated', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' };
      default:
        return { label: 'Draft', className: 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400' };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="flex items-center justify-between gap-4">
      {/* Left section - Logo & Navigation */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-full border border-slate-200 dark:border-slate-700">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          title="Back to Dashboard"
        >
          <Home className="w-4 h-4" />
        </button>
        
        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 px-2">
          <JasperLogo className="w-6 h-6 text-slate-800 dark:text-white" />
          <span className="text-sm font-semibold text-slate-800 dark:text-white">Jasper</span>
        </Link>
      </div>

      {/* Center section - Project info */}
      <div className="flex items-center gap-3 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-full border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span className="text-sm font-medium text-slate-800 dark:text-white max-w-[200px] truncate">{projectName}</span>
        </div>
        
        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />
        
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}>
          {statusConfig.label}
        </span>
        
        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />
        
        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onSaveVersion}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
            title="Save Version"
          >
            <Save className="w-4 h-4" />
          </button>
          
          <button
            onClick={onRunSimulation}
            disabled={isSimulating}
            className={`p-2 rounded-full transition-colors ${
              isSimulating 
                ? 'text-teal-600 dark:text-teal-400' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title="Run Simulation"
          >
            {isSimulating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Right section - Theme & User */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-full border border-slate-200 dark:border-slate-700 transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-white">{user?.name || 'User'}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Dropdown menu */}
          {showUserMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 z-50 w-48 py-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <div className="my-1 border-t border-slate-200 dark:border-slate-700" />
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
