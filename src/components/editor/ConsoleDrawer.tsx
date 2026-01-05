import { useState } from 'react';
import { 
  Terminal,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronUp,
  ChevronDown,
  Activity,
  Zap,
  Flame,
  Cloud,
  DollarSign,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../data/api';
import type { SimulationRun } from '../../core/schema';

interface ConsoleDrawerProps {
  projectId: string;
  latestRunId: string | null;
}

export default function ConsoleDrawer({ projectId, latestRunId }: ConsoleDrawerProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [activeView, setActiveView] = useState<'summary' | 'kpis' | 'violations'>('summary');

  const { data: runs = [] } = useQuery({
    queryKey: ['runs', projectId],
    queryFn: () => api.listRuns(projectId),
  });

  const latestRun: SimulationRun | undefined = latestRunId
    ? runs.find((r) => r.runId === latestRunId)
    : runs[runs.length - 1];

  // Collapsed state - just a status indicator
  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className={`island island-pill flex items-center gap-2 px-4 py-2 transition-all hover:shadow-lg ${
          !latestRun 
            ? '' 
            : latestRun.converged 
              ? 'border-success/30' 
              : 'border-destructive/30'
        }`}
      >
        <Terminal className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Console</span>
        {latestRun && (
          <>
            <div className="w-px h-4 bg-border" />
            {latestRun.converged ? (
              <div className="flex items-center gap-1.5 text-success">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-semibold">OK</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-destructive">
                <XCircle className="w-4 h-4" />
                <span className="text-xs font-semibold">FAIL</span>
              </div>
            )}
            {latestRun.violations.length > 0 && (
              <span className="flex items-center gap-1 text-warning text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                {latestRun.violations.length}
              </span>
            )}
          </>
        )}
        <ChevronUp className="w-4 h-4 text-muted-foreground ml-1" />
      </button>
    );
  }

  // No run available
  if (!latestRun) {
    return (
      <div className={`island island-animate-in ${expanded ? 'w-[500px]' : 'w-80'} transition-all duration-200`}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Console</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors hover:bg-muted/50"
            >
              {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors hover:bg-muted/50"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="empty-state">
            <Activity className="empty-state-icon" />
            <p className="empty-state-title">No simulation results</p>
            <p className="empty-state-desc">Run a simulation to see output here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`island island-animate-in ${expanded ? 'w-[500px]' : 'w-80'} max-h-[400px] flex flex-col transition-all duration-200`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">Console</span>
          </div>
          <div className={`badge ${latestRun.converged ? 'badge-success' : 'badge-destructive'}`}>
            {latestRun.converged ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                Converged
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3" />
                Failed
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors hover:bg-muted/50"
          >
            {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors hover:bg-muted/50"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* View tabs */}
      <div className="flex gap-1 px-3 py-2 border-b border-border shrink-0">
        <button
          onClick={() => setActiveView('summary')}
          className={`tab-btn ${activeView === 'summary' ? 'tab-btn-active' : ''}`}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveView('kpis')}
          className={`tab-btn ${activeView === 'kpis' ? 'tab-btn-active' : ''}`}
        >
          KPIs
        </button>
        <button
          onClick={() => setActiveView('violations')}
          className={`tab-btn relative ${activeView === 'violations' ? 'tab-btn-active' : ''}`}
        >
          Violations
          {latestRun.violations.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold bg-warning/15 text-warning rounded-full">
              {latestRun.violations.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {activeView === 'summary' && (
          <div className="space-y-4">
            {/* Run info */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Run ID</span>
              <span className="font-mono font-medium text-foreground">#{latestRun.runId.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Timestamp</span>
              <span className="font-medium text-foreground">
                {new Date(latestRun.createdAt).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            
            {/* Quick KPI summary */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {latestRun.kpis.steam !== undefined && (
                <div className="p-3 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-1.5 text-orange-500 mb-1">
                    <Flame className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-semibold uppercase tracking-wide">Steam</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    {(latestRun.kpis.steam as number).toFixed(1)}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-1">GJ/hr</span>
                </div>
              )}
              {latestRun.kpis.electricity !== undefined && (
                <div className="p-3 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-1.5 text-yellow-500 mb-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-semibold uppercase tracking-wide">Power</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    {(latestRun.kpis.electricity as number).toFixed(1)}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-1">kW</span>
                </div>
              )}
              {latestRun.kpis.CO2_emissions !== undefined && (
                <div className="p-3 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-1.5 text-emerald-500 mb-1">
                    <Cloud className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-semibold uppercase tracking-wide">CO₂</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    {(latestRun.kpis.CO2_emissions as number).toFixed(1)}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-1">t/hr</span>
                </div>
              )}
              {latestRun.kpis.COM !== undefined && (
                <div className="p-3 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-1.5 text-primary mb-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-semibold uppercase tracking-wide">COM</span>
                  </div>
                  <span className="text-lg font-bold text-foreground">
                    {(latestRun.kpis.COM as number).toFixed(0)}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-1">$/hr</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'kpis' && (
          <div className="space-y-2">
            {Object.entries(latestRun.kpis).map(([key, value]) => (
              <div 
                key={key}
                className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg"
              >
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{key.replace(/_/g, ' ')}</span>
                <span className="text-sm font-bold text-foreground font-mono">
                  {typeof value === 'number' ? value.toFixed(2) : String(value)}
                </span>
              </div>
            ))}
          </div>
        )}

        {activeView === 'violations' && (
          <div className="space-y-2">
            {latestRun.violations.length === 0 ? (
              <div className="empty-state py-6">
                <CheckCircle2 className="empty-state-icon text-success/50" />
                <p className="empty-state-title text-success">All constraints satisfied</p>
              </div>
            ) : (
              latestRun.violations.map((v, i) => (
                <div 
                  key={i}
                  className={`p-3 rounded-xl border-l-2 ${
                    v.hard 
                      ? 'bg-destructive/5 border-destructive' 
                      : 'bg-warning/5 border-warning'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                      v.hard ? 'text-destructive' : 'text-warning'
                    }`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{v.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-muted-foreground">
                          Value: {v.value.toFixed(2)}
                        </span>
                        <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                          v.hard 
                            ? 'bg-destructive/15 text-destructive' 
                            : 'bg-warning/15 text-warning'
                        }`}>
                          {v.hard ? 'Hard' : 'Soft'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
