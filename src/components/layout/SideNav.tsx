import { useState } from 'react';
import { 
  GitBranch, 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  Layers,
  CheckCircle2,
  XCircle,
  MoreHorizontal
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../data/api';

interface SideNavProps {
  projectId: string;
  onVersionSelect?: (versionId: string) => void;
  onRunSelect?: (runId: string) => void;
}

export default function SideNav({ projectId, onVersionSelect, onRunSelect }: SideNavProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'versions' | 'runs'>('versions');

  const { data: versions = [] } = useQuery({
    queryKey: ['versions', projectId],
    queryFn: () => api.listVersions(projectId),
  });

  const { data: runs = [] } = useQuery({
    queryKey: ['runs', projectId],
    queryFn: () => api.listRuns(projectId),
  });

  // Collapsed state - just icons
  if (collapsed) {
    return (
      <div className="island flex flex-col items-center py-2 gap-1">
        <button
          onClick={() => setCollapsed(false)}
          className="toolbar-btn"
          title="Expand"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        
        <div className="toolbar-divider !h-px !w-6 !mx-0 my-1" />
        
        <button
          onClick={() => { setActiveTab('versions'); setCollapsed(false); }}
          className={`toolbar-btn relative ${activeTab === 'versions' ? 'toolbar-btn-active' : ''}`}
          title="Versions"
        >
          <GitBranch className="w-4 h-4" />
          {versions.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[9px] font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center">
              {versions.length}
            </span>
          )}
        </button>
        
        <button
          onClick={() => { setActiveTab('runs'); setCollapsed(false); }}
          className={`toolbar-btn relative ${activeTab === 'runs' ? 'toolbar-btn-active' : ''}`}
          title="Simulation Runs"
        >
          <Play className="w-4 h-4" />
          {runs.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-[9px] font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center">
              {runs.length}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="island w-64 flex flex-col max-h-[480px] island-animate-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="segment-control flex-1 mr-2">
          <button
            onClick={() => setActiveTab('versions')}
            className={`segment-btn ${activeTab === 'versions' ? 'segment-btn-active' : ''}`}
          >
            <GitBranch className="w-3 h-3 mr-1.5 inline" />
            Versions
          </button>
          <button
            onClick={() => setActiveTab('runs')}
            className={`segment-btn ${activeTab === 'runs' ? 'segment-btn-active' : ''}`}
          >
            <Play className="w-3 h-3 mr-1.5 inline" />
            Runs
          </button>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors hover:bg-muted/50"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        {activeTab === 'versions' && (
          <>
            {versions.length === 0 ? (
              <div className="empty-state py-8">
                <Layers className="empty-state-icon" />
                <p className="empty-state-title">No versions yet</p>
                <p className="empty-state-desc">Save a version to create a checkpoint</p>
              </div>
            ) : (
              <div className="space-y-1">
                {versions.map((version) => (
                  <button
                    key={version.versionId}
                    onClick={() => onVersionSelect?.(version.versionId)}
                    className="list-item w-full text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <GitBranch className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground truncate">{version.label}</div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(version.createdAt).toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <button className="p-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'runs' && (
          <>
            {runs.length === 0 ? (
              <div className="empty-state py-8">
                <Play className="empty-state-icon" />
                <p className="empty-state-title">No simulations yet</p>
                <p className="empty-state-desc">Run a simulation to see results</p>
              </div>
            ) : (
              <div className="space-y-1">
                {runs.map((run) => (
                  <button
                    key={run.runId}
                    onClick={() => onRunSelect?.(run.runId)}
                    className="list-item w-full text-left group"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      run.converged 
                        ? 'bg-success/10 text-success' 
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {run.converged ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-medium text-foreground">
                          #{run.runId.slice(-6).toUpperCase()}
                        </span>
                        <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                          run.converged 
                            ? 'bg-success/15 text-success' 
                            : 'bg-destructive/15 text-destructive'
                        }`}>
                          {run.converged ? 'OK' : 'FAIL'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(run.createdAt).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
