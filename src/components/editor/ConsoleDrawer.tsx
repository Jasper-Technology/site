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
  Snowflake,
  Maximize2,
  Minimize2,
  Table2,
  ScrollText,
  Beaker,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../data/api';
import type { SimulationRun } from '../../core/schema';

interface ConsoleDrawerProps {
  projectId: string;
  latestRunId: string | null;
}

export default function ConsoleDrawer({
  projectId,
  latestRunId,
}: ConsoleDrawerProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'results' | 'log'>('results');
  const [streamView, setStreamView] = useState<'table' | 'composition'>(
    'table'
  );

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
      <div
        className={`island island-animate-in ${expanded ? 'w-[600px]' : 'w-96'} transition-all duration-200`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              Console
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors hover:bg-muted/50"
            >
              {expanded ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
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
            <p className="empty-state-desc">
              Run a simulation to see output here
            </p>
          </div>
        </div>
      </div>
    );
  }

  const hasErrors =
    latestRun.status === 'error' && latestRun.rawOutputs?.validationErrors;
  const streams = latestRun.rawOutputs?.streams || [];
  const hasStreams = Array.isArray(streams) && streams.length > 0;
  const kpis = latestRun.kpis || {};

  return (
    <div
      className={`island island-animate-in ${expanded ? 'w-[700px]' : 'w-[420px]'} max-h-[480px] flex flex-col transition-all duration-200`}
    >
      {/* Header with status and controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              Console
            </span>
          </div>
          <div
            className={`badge ${latestRun.converged ? 'badge-success' : 'badge-destructive'}`}
          >
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
          {latestRun.violations.length > 0 && (
            <div className="badge badge-warning">
              <AlertTriangle className="w-3 h-3" />
              {latestRun.violations.length} warning
              {latestRun.violations.length > 1 ? 's' : ''}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors hover:bg-muted/50"
          >
            {expanded ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors hover:bg-muted/50"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Two main tabs: Results and Log */}
      <div className="flex items-center gap-1 px-3 py-2 border-b border-border shrink-0 bg-muted/20">
        <button
          onClick={() => setActiveTab('results')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'results'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Results
        </button>
        <button
          onClick={() => setActiveTab('log')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'log'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <ScrollText className="w-3.5 h-3.5" />
          Execution Log
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'results' && (
          <div className="p-4 space-y-4">
            {/* Error section - show prominently if failed */}
            {hasErrors && (
              <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-destructive mb-3">
                  <XCircle className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    Simulation Failed
                  </span>
                </div>
                <div className="space-y-2">
                  {(latestRun.rawOutputs.validationErrors as any[]).map(
                    (err, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-xs text-foreground"
                      >
                        <span className="shrink-0 px-1.5 py-0.5 bg-destructive/10 text-destructive rounded text-[10px] font-semibold uppercase">
                          {err.category}
                        </span>
                        <span>{err.message}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Warnings section */}
            {latestRun.violations.length > 0 && (
              <div className="bg-warning/5 border border-warning/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-warning mb-3">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-semibold">
                    Constraint Warnings
                  </span>
                </div>
                <div className="space-y-2">
                  {latestRun.violations.map((v, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-2 text-xs"
                    >
                      <span className="text-foreground">{v.message}</span>
                      <span className="shrink-0 font-mono text-muted-foreground">
                        {v.value.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* KPIs - compact horizontal cards */}
            {latestRun.converged && Object.keys(kpis).length > 0 && (
              <div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Key Performance Indicators
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {kpis.steam !== undefined && (
                    <KpiCard
                      icon={<Flame className="w-3.5 h-3.5" />}
                      label="Heating"
                      value={(kpis.steam as number).toFixed(2)}
                      unit="GJ/h"
                      color="text-orange-500"
                    />
                  )}
                  {kpis.cooling !== undefined && (
                    <KpiCard
                      icon={<Snowflake className="w-3.5 h-3.5" />}
                      label="Cooling"
                      value={(kpis.cooling as number).toFixed(2)}
                      unit="GJ/h"
                      color="text-cyan-500"
                    />
                  )}
                  {kpis.electricity !== undefined && (
                    <KpiCard
                      icon={<Zap className="w-3.5 h-3.5" />}
                      label="Power"
                      value={(kpis.electricity as number).toFixed(2)}
                      unit="kW"
                      color="text-yellow-500"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Streams section with toggle */}
            {hasStreams && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Stream Results
                  </div>
                  <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-0.5">
                    <button
                      onClick={() => setStreamView('table')}
                      className={`p-1.5 rounded transition-all ${
                        streamView === 'table'
                          ? 'bg-background shadow-sm text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="Table view"
                    >
                      <Table2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setStreamView('composition')}
                      className={`p-1.5 rounded transition-all ${
                        streamView === 'composition'
                          ? 'bg-background shadow-sm text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      title="Composition view"
                    >
                      <Beaker className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {streamView === 'table' ? (
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted/30 border-b border-border">
                          <th className="text-left py-2 px-3 font-semibold text-foreground">
                            Stream
                          </th>
                          <th className="text-right py-2 px-3 font-semibold text-foreground">
                            T (K)
                          </th>
                          <th className="text-right py-2 px-3 font-semibold text-foreground">
                            P (bar)
                          </th>
                          <th className="text-right py-2 px-3 font-semibold text-foreground">
                            Flow
                          </th>
                          <th className="text-center py-2 px-3 font-semibold text-foreground">
                            Phase
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {streams.map((stream: any, idx: number) => (
                          <tr
                            key={stream.id || idx}
                            className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                          >
                            <td className="py-2 px-3 font-medium text-foreground">
                              {formatStreamName(stream.name)}
                            </td>
                            <td className="text-right py-2 px-3 font-mono text-muted-foreground">
                              {stream.T?.toFixed(1) || '-'}
                            </td>
                            <td className="text-right py-2 px-3 font-mono text-muted-foreground">
                              {stream.P?.toFixed(2) || '-'}
                            </td>
                            <td className="text-right py-2 px-3 font-mono text-muted-foreground">
                              {stream.flow?.toFixed(1) || '-'}
                            </td>
                            <td className="text-center py-2 px-3">
                              <PhaseBadge phase={stream.phase} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                    {streams.map((stream: any, idx: number) => {
                      if (
                        !stream.composition ||
                        Object.keys(stream.composition).length === 0
                      )
                        return null;
                      return (
                        <div
                          key={stream.id || idx}
                          className="bg-muted/20 rounded-lg p-3 border border-border/50"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-foreground text-xs">
                              {formatStreamName(stream.name)}
                            </span>
                            <PhaseBadge phase={stream.phase} />
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            {Object.entries(stream.composition).map(
                              ([comp, frac]: [string, any]) => (
                                <div
                                  key={comp}
                                  className="flex justify-between text-[11px]"
                                >
                                  <span className="text-muted-foreground">
                                    {comp}
                                  </span>
                                  <span className="font-mono text-foreground">
                                    {(frac * 100).toFixed(1)}%
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Run metadata - compact footer */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border">
              <span>
                Run #{latestRun.runId.slice(-6).toUpperCase()} at{' '}
                {new Date(latestRun.createdAt).toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span className="font-mono">
                {streams.length} stream{streams.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {activeTab === 'log' && (
          <div className="p-4">
            {latestRun.rawOutputs?.log &&
            Array.isArray(latestRun.rawOutputs.log) &&
            latestRun.rawOutputs.log.length > 0 ? (
              <div className="bg-slate-950 dark:bg-slate-950/50 rounded-xl p-4 font-mono text-[11px] overflow-x-auto border border-slate-800">
                <div className="space-y-0.5 text-slate-300">
                  {latestRun.rawOutputs.log.map((line: string, idx: number) => (
                    <div key={idx} className="whitespace-pre leading-relaxed">
                      {formatLogLine(line)}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-state py-8">
                <Terminal className="empty-state-icon text-muted-foreground/50" />
                <p className="empty-state-title">No execution log</p>
                <p className="empty-state-desc">
                  Run a simulation to see the execution trace
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper components

function KpiCard({
  icon,
  label,
  value,
  unit,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <div className="bg-muted/30 rounded-xl p-3 border border-border/50">
      <div className={`flex items-center gap-1.5 ${color} mb-1`}>
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold text-foreground">{value}</span>
        <span className="text-[10px] text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}

function PhaseBadge({ phase }: { phase: string }) {
  const styles = {
    V: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    L: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400',
    VL: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  };

  const labels = {
    V: 'Vapor',
    L: 'Liquid',
    VL: 'Two-Phase',
  };

  return (
    <span
      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${styles[phase as keyof typeof styles] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
    >
      {labels[phase as keyof typeof labels] || phase || '?'}
    </span>
  );
}

function formatStreamName(name: string): string {
  // Clean up stream names like "Gas Feed-out" -> "Gas Feed"
  // or "Flash Separator-vapor" -> "Flash (Vapor)"
  if (name.endsWith('-out')) {
    return name.replace('-out', '');
  }
  if (name.endsWith('-vapor')) {
    return name.replace('-vapor', ' (V)');
  }
  if (name.endsWith('-liquid')) {
    return name.replace('-liquid', ' (L)');
  }
  return name;
}

function formatLogLine(line: string): React.ReactNode {
  // Add color coding to log lines
  if (line.includes('JASPER SIMULATION')) {
    return <span className="text-blue-400 font-bold">{line}</span>;
  }
  if (line.startsWith('═') || line.startsWith('─')) {
    return <span className="text-slate-600">{line}</span>;
  }
  if (line.includes('PHASE')) {
    return <span className="text-slate-400 font-semibold">{line}</span>;
  }
  if (line.includes('✓')) {
    return <span className="text-emerald-400">{line}</span>;
  }
  if (line.includes('✗')) {
    return <span className="text-red-400">{line}</span>;
  }
  if (line.includes('COMPLETED SUCCESSFULLY')) {
    return <span className="text-emerald-400 font-bold">{line}</span>;
  }
  return line;
}
