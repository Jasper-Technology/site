import { useState, useEffect } from 'react';
import { 
  Settings2, 
  GitBranch as StreamIcon,
  Target,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Play,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import NodePanel from './NodePanel';
import StreamPanel from './StreamPanel';
import SpecsPanel from './SpecsPanel';
import ConstraintsPanel from './ConstraintsPanel';
import ObjectivePanel from './ObjectivePanel';
import EconomicsPanel from './EconomicsPanel';
import RunsPanel from './RunsPanel';
import type { JasperProject } from '../../core/schema';

interface InspectorProps {
  project: JasperProject;
  onProjectChange: (project: JasperProject) => void;
  selectedNodeId: string | null;
  selectedStreamId: string | null;
  latestRunId: string | null;
}

interface Tab {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'node', label: 'Unit Properties', shortLabel: 'Unit', icon: <Settings2 className="w-4 h-4" /> },
  { id: 'stream', label: 'Stream Properties', shortLabel: 'Stream', icon: <StreamIcon className="w-4 h-4" /> },
  { id: 'specs', label: 'Specifications', shortLabel: 'Specs', icon: <Target className="w-4 h-4" /> },
  { id: 'constraints', label: 'Constraints', shortLabel: 'Const', icon: <AlertTriangle className="w-4 h-4" /> },
  { id: 'objective', label: 'Objective', shortLabel: 'Obj', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'economics', label: 'Economics', shortLabel: 'Econ', icon: <DollarSign className="w-4 h-4" /> },
  { id: 'runs', label: 'Run History', shortLabel: 'Runs', icon: <Play className="w-4 h-4" /> },
];

export default function Inspector({
  project,
  onProjectChange,
  selectedNodeId,
  selectedStreamId,
  latestRunId,
}: InspectorProps) {
  const { setSelectedStream } = useEditorStore();
  const [activeTab, setActiveTab] = useState('node');
  const [collapsed, setCollapsed] = useState(true); // Collapsed by default
  const [expanded, setExpanded] = useState(false);

  // Auto-switch to relevant tab and auto-expand when selection changes
  useEffect(() => {
    if (selectedNodeId) {
      setActiveTab('node');
      setCollapsed(false);
    } else if (selectedStreamId) {
      setActiveTab('stream');
      setCollapsed(false);
    }
    // Don't auto-collapse when selection is cleared - let user manually collapse
  }, [selectedNodeId, selectedStreamId]);
  
  const effectiveTab = activeTab;

  if (collapsed) {
    return (
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center py-2 gap-1">
        <button
          onClick={() => {
            setCollapsed(false);
          }}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
          title="Expand Inspector"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <div className="w-6 h-px bg-slate-200 dark:bg-slate-700 my-1" />
        
        {tabs.slice(0, 4).map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setCollapsed(false); }}
            className={`p-2 rounded-xl transition-colors ${
              effectiveTab === tab.id 
                ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title={tab.label}
          >
            {tab.icon}
          </button>
        ))}
        
        <div className="w-6 h-px bg-slate-200 dark:bg-slate-700 my-1" />
        
        {tabs.slice(4).map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setCollapsed(false); }}
            className={`p-2 rounded-xl transition-colors ${
              effectiveTab === tab.id 
                ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title={tab.label}
          >
            {tab.icon}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-700 flex ${expanded ? 'w-[520px]' : 'w-80'} h-full transition-all duration-200`}>
      {/* Tab navigation - Vertical on left */}
      <div className="flex flex-col items-stretch py-2 px-1 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-l-2xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`p-2.5 rounded-xl transition-colors mb-1 ${
              effectiveTab === tab.id 
                ? 'text-teal-600 dark:text-teal-400 bg-white dark:bg-slate-700' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
            }`}
            title={tab.label}
          >
            {tab.icon}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            {tabs.find(t => t.id === effectiveTab)?.icon}
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
              {tabs.find(t => t.id === effectiveTab)?.label}
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
              title={expanded ? 'Shrink' : 'Expand'}
            >
              {expanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => {
                setCollapsed(true);
              }}
              className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
              title="Collapse"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          {effectiveTab === 'node' && (
            <NodePanel
              project={project}
              onProjectChange={onProjectChange}
              nodeId={selectedNodeId}
            />
          )}
          {effectiveTab === 'stream' && (
            <StreamPanel
              project={project}
              onProjectChange={onProjectChange}
              streamId={selectedStreamId}
              latestRunId={latestRunId}
              onStreamSelect={(streamId) => setSelectedStream(streamId)}
            />
          )}
          {effectiveTab === 'specs' && (
            <SpecsPanel
              project={project}
              onProjectChange={onProjectChange}
              latestRunId={latestRunId}
            />
          )}
          {effectiveTab === 'constraints' && (
            <ConstraintsPanel
              project={project}
              onProjectChange={onProjectChange}
              latestRunId={latestRunId}
            />
          )}
          {effectiveTab === 'objective' && (
            <ObjectivePanel
              project={project}
              onProjectChange={onProjectChange}
            />
          )}
          {effectiveTab === 'economics' && (
            <EconomicsPanel
              project={project}
              onProjectChange={onProjectChange}
            />
          )}
          {effectiveTab === 'runs' && (
            <RunsPanel projectId={project.projectId} />
          )}
        </div>
      </div>
    </div>
  );
}
