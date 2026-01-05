import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../data/api';
import { createBlankTemplate, createDEACO2CaptureTemplate } from '../../data/seed';
import { useAuthStore } from '../../store/authStore';
import { 
  Plus, 
  FolderOpen, 
  Trash2, 
  Clock, 
  ArrowRight,
  Sparkles,
  FileCode2,
  FlaskConical,
  X,
  LogOut,
  User,
  Moon,
  Sun
} from 'lucide-react';
import { JasperLogo, useTheme } from './Landing';

const MAX_PROJECTS = 2; // Project limit to manage memory

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();
  const { isDark, toggle } = useTheme();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [template, setTemplate] = useState<'blank' | 'dea'>('blank');
  const [projectName, setProjectName] = useState('');

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.listProjects(),
  });
  
  const hasReachedLimit = projects.length >= MAX_PROJECTS;

  const createMutation = useMutation({
    mutationFn: (name: string) => {
      const templateData = template === 'blank' ? createBlankTemplate() : createDEACO2CaptureTemplate();
      return api.createProject({
        name,
        ...templateData,
      });
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowCreateModal(false);
      setProjectName('');
      navigate(`/editor/${project.projectId}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => api.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const handleCreate = () => {
    if (projectName.trim() && !hasReachedLimit) {
      createMutation.mutate(projectName.trim());
    }
  };

  const handleSignOut = () => {
    setUser(null as any);
    navigate('/signin');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'feasible':
        return { label: 'Feasible', className: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' };
      case 'optimized':
        return { label: 'Optimized', className: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400' };
      case 'sim_ok':
        return { label: 'Simulated', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' };
      case 'failed':
        return { label: 'Failed', className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' };
      default:
        return { label: 'Draft', className: 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400' };
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Top bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <JasperLogo className="w-8 h-8 text-slate-800 dark:text-white" />
            <span className="text-xl font-semibold text-slate-800 dark:text-white tracking-tight">Jasper</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{user?.name || 'User'}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Hero section */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-slate-800 dark:text-white mb-2">
              Your Projects
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {hasReachedLimit 
                ? `Project limit reached (${projects.length}/${MAX_PROJECTS})`
                : 'Design, simulate, and optimize chemical processes'
              }
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={hasReachedLimit}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-full hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={hasReachedLimit ? `Maximum ${MAX_PROJECTS} projects allowed` : 'Create a new project'}
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {/* Projects grid */}
        {projects.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700/50 p-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center mb-6">
              <FolderOpen className="w-10 h-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">No projects yet</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8">
              Create your first chemical process design project to get started
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={hasReachedLimit}
              className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-medium rounded-full hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4" />
              Create your first project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const statusConfig = getStatusConfig(project.status);
              return (
                <button
                  key={project.projectId}
                  onClick={() => navigate(`/editor/${project.projectId}`)}
                  className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 text-left p-5 group hover:shadow-lg hover:border-slate-200 dark:hover:border-slate-600 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                      <FlaskConical className="w-5 h-5" />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-1 truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {project.name}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(project.updatedAt)}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700/50">
                        {project.flowsheet.nodes.length} units
                      </span>
                      <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700/50">
                        {project.flowsheet.edges.length} streams
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this project?')) {
                            deleteMutation.mutate(project.projectId);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </button>
              );
            })}
            
            {/* Quick create card */}
            {!hasReachedLimit && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="rounded-2xl p-5 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-600 bg-transparent hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-all duration-200 flex flex-col items-center justify-center min-h-[200px] group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 flex items-center justify-center mb-3 transition-colors">
                  <Plus className="w-6 h-6 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                  New project
                </span>
              </button>
            )}
          </div>
        )}
      </main>

      {/* Create modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            className="absolute inset-0" 
            onClick={() => setShowCreateModal(false)} 
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-700">
              <div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Create Project</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Set up your new process design</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Project name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Project Name</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                  placeholder="e.g., Ethanol Dehydration Unit"
                  autoFocus
                />
              </div>
              
              {/* Template selection */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Template</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTemplate('blank')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      template === 'blank' 
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' 
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                      template === 'blank' ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}>
                      <FileCode2 className="w-5 h-5" />
                    </div>
                    <div className="font-medium text-slate-800 dark:text-white text-sm">Blank</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Start from scratch</div>
                  </button>
                  
                  <button
                    onClick={() => setTemplate('dea')}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      template === 'dea' 
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20' 
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                      template === 'dea' ? 'bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}>
                      <FlaskConical className="w-5 h-5" />
                    </div>
                    <div className="font-medium text-slate-800 dark:text-white text-sm">CO₂ Capture</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">DEA absorption unit</div>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setProjectName('');
                }}
                className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-medium rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!projectName.trim() || createMutation.isPending}
                className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-full hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
