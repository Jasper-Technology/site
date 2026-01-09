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
  const [activeView, setActiveView] = useState<'summary' | 'kpis' | 'streams' | 'violations'>('summary');

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
          onClick={() => setActiveView('streams')}
          className={`tab-btn ${activeView === 'streams' ? 'tab-btn-active' : ''}`}
        >
          Streams
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
            {/* Show validation errors if simulation failed */}
            {latestRun.status === 'error' && latestRun.rawOutputs?.validationErrors && (
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-semibold">Validation Errors</span>
                </div>
                {(latestRun.rawOutputs.validationErrors as any[]).map((err, i) => (
                  <div 
                    key={i}
                    className="p-3 bg-destructive/5 border-l-2 border-destructive rounded text-xs"
                  >
                    <span className="font-semibold text-destructive uppercase text-[10px]">
                      [{err.category}]
                    </span>
                    <p className="text-foreground mt-1">{err.message}</p>
                  </div>
                ))}
                {latestRun.rawOutputs.validationWarnings && (latestRun.rawOutputs.validationWarnings as any[]).length > 0 && (
                  <>
                    <div className="flex items-center gap-2 text-warning mt-4 mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-semibold">Warnings</span>
                    </div>
                    {(latestRun.rawOutputs.validationWarnings as any[]).map((warn, i) => (
                      <div 
                        key={i}
                        className="p-3 bg-warning/5 border-l-2 border-warning rounded text-xs"
                      >
                        <span className="font-semibold text-warning uppercase text-[10px]">
                          [{warn.category}]
                        </span>
                        <p className="text-foreground mt-1">{warn.message}</p>
                      </div>
                    ))}
                  </>
                )}
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground italic">
                    Fix these errors and run again
                  </p>
                </div>
              </div>
            )}

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
            
            {/* Quick KPI summary - only show if simulation succeeded */}
            {latestRun.converged && Object.keys(latestRun.kpis).length > 0 && (
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
            )}
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

        {activeView === 'streams' && (
          <div className="overflow-x-auto">
            {latestRun.rawOutputs?.streams && Array.isArray(latestRun.rawOutputs.streams) && latestRun.rawOutputs.streams.length > 0 ? (
              <div className="min-w-full">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Stream Results Table
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="text-left py-2 px-2 font-semibold text-foreground">Stream</th>
                        <th className="text-right py-2 px-2 font-semibold text-foreground">T (K)</th>
                        <th className="text-right py-2 px-2 font-semibold text-foreground">P (bar)</th>
                        <th className="text-right py-2 px-2 font-semibold text-foreground">Flow (kmol/h)</th>
                        <th className="text-center py-2 px-2 font-semibold text-foreground">Phase</th>
                        <th className="text-right py-2 px-2 font-semibold text-foreground">H (kJ/mol)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latestRun.rawOutputs.streams.map((stream: any, idx: number) => (
                        <tr key={stream.id || idx} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2 px-2 font-medium text-foreground">{stream.name}</td>
                          <td className="text-right py-2 px-2 font-mono text-muted-foreground">{stream.T?.toFixed(1) || '-'}</td>
                          <td className="text-right py-2 px-2 font-mono text-muted-foreground">{stream.P?.toFixed(2) || '-'}</td>
                          <td className="text-right py-2 px-2 font-mono text-muted-foreground">{stream.flow?.toFixed(1) || '-'}</td>
                          <td className="text-center py-2 px-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              stream.phase === 'V' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                              stream.phase === 'L' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400' :
                              'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                            }`}>
                              {stream.phase || '?'}
                            </span>
                          </td>
                          <td className="text-right py-2 px-2 font-mono text-muted-foreground">{stream.H?.toFixed(1) || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Composition details */}
                <div className="mt-4 space-y-3">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Composition Details
                  </div>
                  {latestRun.rawOutputs.streams.map((stream: any, idx: number) => {
                    if (!stream.composition || Object.keys(stream.composition).length === 0) return null;
                    return (
                      <div key={stream.id || idx} className="bg-muted/20 rounded-lg p-3">
                        <div className="font-medium text-foreground text-xs mb-2">{stream.name}</div>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(stream.composition).map(([comp, frac]: [string, any]) => (
                            <div key={comp} className="flex justify-between text-[11px]">
                              <span className="text-muted-foreground">{comp}:</span>
                              <span className="font-mono text-foreground">{(frac * 100).toFixed(2)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="empty-state py-6">
                <Activity className="empty-state-icon" />
                <p className="empty-state-title">No stream data</p>
                <p className="empty-state-desc">Stream results will appear here after simulation</p>
              </div>
            )}
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
