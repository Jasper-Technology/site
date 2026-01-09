import { useMemo } from 'react';
import { Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../data/api';
import type { JasperProject, StreamSpec } from '../../core/schema';

interface StreamPanelProps {
  project: JasperProject;
  onProjectChange: (project: JasperProject) => void;
  streamId: string | null;
  latestRunId: string | null;
  onStreamSelect?: (streamId: string) => void;
}

export default function StreamPanel({ project, onProjectChange, streamId, latestRunId, onStreamSelect }: StreamPanelProps) {
  const stream = useMemo(
    () => project.flowsheet.edges.find((e) => e.id === streamId),
    [project, streamId]
  );

  // Fetch latest run to get calculated stream data
  const { data: runs = [] } = useQuery({
    queryKey: ['runs', project.projectId],
    queryFn: () => api.listRuns(project.projectId),
    enabled: !!project.projectId,
  });

  const latestRun = useMemo(() => {
    if (!latestRunId || runs.length === 0) return null;
    return runs.find((r) => r.runId === latestRunId) || runs[runs.length - 1];
  }, [latestRunId, runs]);

  // Get all streams for dropdown
  const allStreams = project.flowsheet.edges || [];

  if (allStreams.length === 0) {
    return (
      <div className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">
        No streams in flowsheet
      </div>
    );
  }

  // If no stream selected, show first stream
  const currentStream = stream || allStreams[0];
  const currentStreamId = streamId || allStreams[0].id;

  // Find calculated stream data from simulation results
  const calculatedStream = useMemo(() => {
    if (!latestRun?.rawOutputs?.streams || !currentStream) return null;
    if (!Array.isArray(latestRun.rawOutputs.streams)) return null;
    
    // Try to find by name or id
    return latestRun.rawOutputs.streams.find((s: any) => 
      s.name === currentStream.name || s.id === currentStream.id
    );
  }, [latestRun, currentStream]);

  // Determine if this stream is from a Feed block (editable) or calculated (read-only)
  const sourceBlock = useMemo(() => {
    if (!currentStream) return null;
    return project.flowsheet.nodes.find(n => n.id === currentStream.from.nodeId);
  }, [currentStream, project]);

  const isInputStream = sourceBlock?.type === 'Feed';

  // Handle stream selection from dropdown
  const handleStreamChange = (newStreamId: string) => {
    if (onStreamSelect) {
      onStreamSelect(newStreamId);
    }
  };

  const updateSpec = (spec: Partial<StreamSpec>) => {
    const updatedEdges = project.flowsheet.edges.map((e) =>
      e.id === currentStreamId ? { ...e, spec: { ...e.spec, ...spec } } : e
    );
    onProjectChange({
      ...project,
      flowsheet: { ...project.flowsheet, edges: updatedEdges },
    });
  };

  const updateName = (name: string) => {
    const updatedEdges = project.flowsheet.edges.map((e) =>
      e.id === currentStreamId ? { ...e, name } : e
    );
    onProjectChange({
      ...project,
      flowsheet: { ...project.flowsheet, edges: updatedEdges },
    });
  };

  const updateComposition = (component: string, fraction: number) => {
    const newComposition = { ...(currentStream.spec?.composition || {}), [component]: fraction };
    updateSpec({ composition: newComposition });
  };

  const components = project.components || [];
  
  // Use calculated values if available (for read-only streams), otherwise use spec
  const displayValues = useMemo(() => {
    if (!currentStream) {
      return {
        flow: 0,
        flowUnit: 'kmol/h',
        T: 0,
        TUnit: 'C',
        P: 0,
        PUnit: 'bar',
        composition: {},
      };
    }

    if (isInputStream || !calculatedStream) {
      // For input streams or if no calc data, use spec
      return {
        flow: currentStream.spec?.flow?.value ?? 0,
        flowUnit: currentStream.spec?.flow?.unit || 'kmol/h',
        T: currentStream.spec?.T?.value ?? 0,
        TUnit: currentStream.spec?.T?.unit || 'C',
        P: currentStream.spec?.P?.value ?? 0,
        PUnit: currentStream.spec?.P?.unit || 'bar',
        composition: currentStream.spec?.composition || {},
      };
    } else {
      // For calculated streams, use simulation results
      // Convert K to display unit
      let displayT = calculatedStream.T ?? 0;
      const TUnit = currentStream.spec?.T?.unit || 'C';
      
      try {
        if (displayT > 0 && TUnit === 'C') {
          displayT = displayT - 273.15;
        } else if (displayT > 0 && TUnit === 'F') {
          displayT = (displayT - 273.15) * 9/5 + 32;
        }
        // K stays as is
      } catch (e) {
        console.error('Error converting temperature:', e);
        displayT = 0;
      }
      
      return {
        flow: calculatedStream.flow ?? 0,
        flowUnit: 'kmol/h',
        T: displayT,
        TUnit: TUnit,
        P: calculatedStream.P ?? 0,
        PUnit: 'bar',
        composition: calculatedStream.composition || {},
      };
    }
  }, [isInputStream, calculatedStream, currentStream]);

  const composition = displayValues?.composition || {};
  const total = Object.keys(composition).length > 0 
    ? Object.values(composition).reduce((sum: number, val: any) => sum + (Number(val) || 0), 0)
    : 0;

  return (
    <div className="space-y-4">
      {/* Stream Selector Dropdown - AspenPlus Style */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Stream</label>
        <select
          value={currentStreamId}
          onChange={(e) => handleStreamChange(e.target.value)}
          className="input w-full"
        >
          {allStreams.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Read-only banner for calculated streams */}
      {!isInputStream && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">Calculated Stream (Read-Only)</p>
            <p className="text-blue-600 dark:text-blue-400">
              {calculatedStream 
                ? "These properties are calculated by the simulator. To change them, edit the upstream equipment or inlet conditions."
                : "Run simulation to see calculated properties."}
            </p>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
        <input
          type="text"
          value={currentStream.name}
          onChange={(e) => updateName(e.target.value)}
          className="input"
          disabled={!isInputStream}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Flow Rate</label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={displayValues.flow || ''}
            onChange={(e) =>
              updateSpec({
                flow: {
                  value: parseFloat(e.target.value) || 0,
                  unit: displayValues.flowUnit,
                },
              })
            }
            className="input flex-1"
            placeholder="Flow rate"
            disabled={!isInputStream}
          />
          <select
            value={displayValues.flowUnit}
            onChange={(e) =>
              updateSpec({
                flow: { value: displayValues.flow, unit: e.target.value },
              })
            }
            className="input w-28"
            disabled={!isInputStream}
          >
            <option value="kmol/h">kmol/h</option>
            <option value="kg/h">kg/h</option>
            <option value="m3/h">m³/h</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Temperature</label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={displayValues.T ? displayValues.T.toFixed(2) : ''}
            onChange={(e) =>
              updateSpec({
                T: { value: parseFloat(e.target.value) || 0, unit: displayValues.TUnit },
              })
            }
            className="input flex-1"
            placeholder="Temperature"
            disabled={!isInputStream}
          />
          <select
            value={displayValues.TUnit}
            onChange={(e) =>
              updateSpec({
                T: { value: displayValues.T, unit: e.target.value },
              })
            }
            className="input w-20"
            disabled={!isInputStream}
          >
            <option value="C">°C</option>
            <option value="K">K</option>
            <option value="F">°F</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pressure</label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={displayValues.P ? displayValues.P.toFixed(2) : ''}
            onChange={(e) =>
              updateSpec({
                P: { value: parseFloat(e.target.value) || 0, unit: displayValues.PUnit },
              })
            }
            className="input flex-1"
            placeholder="Pressure"
            disabled={!isInputStream}
          />
          <select
            value={displayValues.PUnit}
            onChange={(e) =>
              updateSpec({
                P: { value: displayValues.P, unit: e.target.value },
              })
            }
            className="input w-20"
            disabled={!isInputStream}
          >
            <option value="bar">bar</option>
            <option value="Pa">Pa</option>
            <option value="psi">psi</option>
          </select>
        </div>
      </div>

      {/* Phase indicator for calculated streams */}
      {!isInputStream && calculatedStream && calculatedStream.phase && (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phase</label>
          <div className={`px-3 py-2 rounded-lg font-medium text-sm ${
            calculatedStream.phase === 'V' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
            calculatedStream.phase === 'L' ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400' :
            'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
          }`}>
            {calculatedStream.phase === 'V' ? 'Vapor' : calculatedStream.phase === 'L' ? 'Liquid' : 'Mixed'}
          </div>
        </div>
      )}

      {/* Composition Section */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Composition (Mole Fraction)
          </label>
          {total > 0 && (
            <span className={`text-xs ${Math.abs(total - 1.0) < 0.01 ? 'text-green-600 dark:text-green-500' : 'text-orange-600 dark:text-orange-500'}`}>
              Total: {total.toFixed(3)}
            </span>
          )}
        </div>
        
        {components.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            No components defined in project
          </p>
        ) : (
          <div className="space-y-2">
            {components.map((comp) => {
              const value = composition[comp.name] || composition[comp.id] || 0;
              return (
                <div key={comp.id} className="flex items-center space-x-2">
                  <span className="text-sm text-slate-700 dark:text-slate-300 w-20 truncate" title={comp.name}>
                    {comp.name}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={value ? value.toFixed(4) : ''}
                    onChange={(e) => updateComposition(comp.name, parseFloat(e.target.value) || 0)}
                    className="input-sm flex-1"
                    placeholder="0.0"
                    disabled={!isInputStream}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Helpful tip for input streams */}
      {isInputStream && (
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            💡 Tip: This is an input stream from a Feed. Changes here affect the simulation results.
          </p>
        </div>
      )}
    </div>
  );
}

