import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../data/api';
import { runSimulation } from '../../sim/jasperSim';
import { generateId } from '../../core/ids';
import TopBar from '../../components/layout/TopBar';
import SideNav from '../../components/layout/SideNav';
import PfdCanvas from '../../components/editor/PfdCanvas';
import BottomToolbar from '../../components/editor/BottomToolbar';
import Inspector from '../../components/editor/Inspector';
import ConsoleDrawer from '../../components/editor/ConsoleDrawer';
import ComponentPickerModal from '../../components/editor/ComponentPickerModal';
import { useEditorStore } from '../../store/editorStore';
import type { JasperProject, UnitType, UnitOpNode, Port, FlowsheetGraph, Component } from '../../core/schema';
import type { XYPosition } from 'reactflow';
import { Loader2 } from 'lucide-react';

export default function Editor() {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  const { selectedNodeId, selectedStreamId, setSelectedNode } = useEditorStore();
  const [latestRunId, setLatestRunId] = useState<string | null>(null);
  
  // Local project state for immediate updates
  const [localProject, setLocalProject] = useState<JasperProject | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Component picker modal state
  const [showComponentPicker, setShowComponentPicker] = useState(false);
  const [pendingFeedNode, setPendingFeedNode] = useState<{
    nodeId: string;
    position: XYPosition;
  } | null>(null);

  // Initial load
  const { data: serverProject, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => (projectId ? api.getProject(projectId) : null),
    enabled: !!projectId,
    staleTime: Infinity, // Don't refetch automatically
  });

  // Initialize local state from server
  useEffect(() => {
    if (serverProject && !localProject) {
      setLocalProject(serverProject);
    }
  }, [serverProject, localProject]);

  // Debounced save to server
  const saveToServer = useCallback((project: JasperProject) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      api.updateProjectDraft(project);
    }, 1000);
  }, []);

  // Cleanup timeout and cache on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      // Clear React Query cache for this project to free memory
      queryClient.removeQueries({ queryKey: ['project', projectId] });
      queryClient.removeQueries({ queryKey: ['runs', projectId] });
      queryClient.removeQueries({ queryKey: ['versions', projectId] });
    };
  }, [queryClient, projectId]);

  const runMutation = useMutation({
    mutationFn: async (versionId: string) => {
      if (!localProject) throw new Error('No project');
      const runResult = await runSimulation(localProject, versionId);
      return api.createRun(projectId!, versionId, runResult);
    },
    onSuccess: (run) => {
      setLatestRunId(run.runId);
      queryClient.invalidateQueries({ queryKey: ['runs', projectId] });
    },
  });

  const versionMutation = useMutation({
    mutationFn: async (label: string) => {
      if (!localProject) throw new Error('No project');
      return api.createVersion(projectId!, label, localProject);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['versions', projectId] });
    },
  });

  // Update project (local + debounced save)
  const updateProject = useCallback((updatedProject: JasperProject) => {
    setLocalProject(updatedProject);
    saveToServer(updatedProject);
  }, [saveToServer]);

  // Handle graph changes from canvas
  const handleGraphChange = useCallback(
    (graph: FlowsheetGraph) => {
      if (!localProject) return;
      updateProject({
        ...localProject,
        flowsheet: graph,
      });
    },
    [localProject, updateProject]
  );

  // Create ports based on unit type
  const createPortsForType = useCallback((type: UnitType): Port[] => {
    const ports: Port[] = [];
    
    switch (type) {
      case 'Feed':
        ports.push({ id: generateId('port'), name: 'out', direction: 'out', phase: 'L' });
        break;
      case 'Sink':
        ports.push({ id: generateId('port'), name: 'in', direction: 'in' });
        break;
      case 'TextBox':
        // TextBox nodes don't have ports
        break;
      case 'Mixer':
        ports.push(
          { id: generateId('port'), name: 'in1', direction: 'in' },
          { id: generateId('port'), name: 'in2', direction: 'in' },
          { id: generateId('port'), name: 'out', direction: 'out' }
        );
        break;
      case 'Splitter':
        ports.push(
          { id: generateId('port'), name: 'in', direction: 'in' },
          { id: generateId('port'), name: 'out1', direction: 'out' },
          { id: generateId('port'), name: 'out2', direction: 'out' }
        );
        break;
      case 'Flash':
        ports.push(
          { id: generateId('port'), name: 'in', direction: 'in' },
          { id: generateId('port'), name: 'vapor', direction: 'out', phase: 'V' },
          { id: generateId('port'), name: 'liquid', direction: 'out', phase: 'L' }
        );
        break;
      case 'Separator':
        ports.push(
          { id: generateId('port'), name: 'in', direction: 'in' },
          { id: generateId('port'), name: 'light', direction: 'out', phase: 'V' },
          { id: generateId('port'), name: 'heavy', direction: 'out', phase: 'L' }
        );
        break;
      case 'Absorber':
        ports.push(
          { id: generateId('port'), name: 'gas-in', direction: 'in' },
          { id: generateId('port'), name: 'liquid-in', direction: 'in' },
          { id: generateId('port'), name: 'gas-out', direction: 'out', phase: 'V' },
          { id: generateId('port'), name: 'liquid-out', direction: 'out', phase: 'L' }
        );
        break;
      case 'Stripper':
      case 'DistillationColumn':
        ports.push(
          { id: generateId('port'), name: 'feed', direction: 'in' },
          { id: generateId('port'), name: 'overhead', direction: 'out', phase: 'V' },
          { id: generateId('port'), name: 'bottoms', direction: 'out', phase: 'L' }
        );
        break;
      case 'HeatExchanger':
        ports.push(
          { id: generateId('port'), name: 'in', direction: 'in' },
          { id: generateId('port'), name: 'out', direction: 'out' },
          { id: generateId('port'), name: 'cold-in', direction: 'in' },
          { id: generateId('port'), name: 'cold-out', direction: 'out' }
        );
        break;
      default:
        ports.push(
          { id: generateId('port'), name: 'in', direction: 'in' },
          { id: generateId('port'), name: 'out', direction: 'out' }
        );
    }
    
    return ports;
  }, []);

  // Add node handler
  const handleAddNode = useCallback(
    (type: UnitType, position?: XYPosition) => {
      if (!localProject) return;

      const nodeId = generateId('node');
      const ports = createPortsForType(type);

      const defaultPosition = position || {
        x: 300 + Math.random() * 100,
        y: 200 + Math.random() * 100,
      };

      // If adding a Feed and no components defined, show the picker first
      if (type === 'Feed' && (!localProject.components || localProject.components.length === 0)) {
        setPendingFeedNode({ nodeId, position: defaultPosition });
        setShowComponentPicker(true);
        return;
      }

      // Initialize params based on type
      const params: Record<string, any> = {};
      if (type === 'TextBox') {
        params.text = { kind: 'string', s: 'Double-click to edit' };
      }

      const newNode: UnitOpNode = {
        id: nodeId,
        type,
        name: `${type}-${localProject.flowsheet.nodes.length + 1}`,
        params,
        ports,
      };

      const updatedProject: JasperProject = {
        ...localProject,
        flowsheet: {
          ...localProject.flowsheet,
          nodes: [...localProject.flowsheet.nodes, newNode],
          layout: {
            ...localProject.flowsheet.layout,
            nodes: {
              ...localProject.flowsheet.layout?.nodes,
              [nodeId]: { x: defaultPosition.x, y: defaultPosition.y },
            },
          },
        },
      };

      updateProject(updatedProject);
      setSelectedNode(nodeId);

      // Log action (non-blocking)
      api.appendAction({
        actionId: generateId('action'),
        projectId: localProject.projectId,
        versionId: localProject.latestVersionId || '',
        actor: 'human',
        createdAt: new Date().toISOString(),
        action: { type: 'ADD_NODE', node: newNode },
      });
    },
    [localProject, updateProject, createPortsForType, setSelectedNode]
  );

  // Handle component selection from picker modal
  const handleSelectComponents = useCallback(
    (components: Component[]) => {
      if (!localProject) return;

      // Merge new components with existing (avoid duplicates)
      const existingIds = new Set((localProject.components || []).map(c => c.id));
      const newComponents = components.filter(c => !existingIds.has(c.id));
      const allComponents = [...(localProject.components || []), ...newComponents];

      // Update project with selected components
      const updatedProject: JasperProject = {
        ...localProject,
        components: allComponents,
      };

      // Update existing Feed blocks to include new components in their composition
      // (only add new components with 0 fraction, don't overwrite existing)
      updatedProject.flowsheet.nodes = updatedProject.flowsheet.nodes.map(node => {
        if (node.type === 'Feed') {
          const compositionParam = node.params.composition as { kind: 'composition'; comp: Record<string, number> } | undefined;
          const existingComp = compositionParam?.comp || {};

          // Add new components with 0 fraction
          const updatedComp = { ...existingComp };
          for (const comp of newComponents) {
            if (!(comp.id in updatedComp)) {
              updatedComp[comp.id] = 0;
            }
          }

          return {
            ...node,
            params: {
              ...node.params,
              composition: { kind: 'composition' as const, comp: updatedComp },
            },
          };
        }
        return node;
      });

      // If we have a pending feed node, create it now
      if (pendingFeedNode) {
        const ports = createPortsForType('Feed');

        // Initialize Feed params with default values and composition for ALL components
        // The first component gets 100%, rest get 0%
        const initialComposition: Record<string, number> = {};
        allComponents.forEach((comp, idx) => {
          initialComposition[comp.id] = idx === 0 ? 1.0 : 0.0;
        });

        const newNode: UnitOpNode = {
          id: pendingFeedNode.nodeId,
          type: 'Feed',
          name: `Feed-${updatedProject.flowsheet.nodes.length + 1}`,
          params: {
            T: { kind: 'quantity', q: { value: 25, unit: 'C' } },
            P: { kind: 'quantity', q: { value: 1, unit: 'bar' } },
            flow: { kind: 'quantity', q: { value: 100, unit: 'kmol/h' } },
            composition: { kind: 'composition', comp: initialComposition },
          },
          ports,
        };

        updatedProject.flowsheet = {
          ...updatedProject.flowsheet,
          nodes: [...updatedProject.flowsheet.nodes, newNode],
          layout: {
            ...updatedProject.flowsheet.layout,
            nodes: {
              ...updatedProject.flowsheet.layout?.nodes,
              [pendingFeedNode.nodeId]: {
                x: pendingFeedNode.position.x,
                y: pendingFeedNode.position.y,
              },
            },
          },
        };

        setSelectedNode(pendingFeedNode.nodeId);
        setPendingFeedNode(null);
      }

      updateProject(updatedProject);
      setShowComponentPicker(false);
    },
    [localProject, pendingFeedNode, createPortsForType, updateProject, setSelectedNode]
  );

  // Handle closing component picker without selecting
  const handleCloseComponentPicker = useCallback(() => {
    // If user skips, still create the feed node (they can add components later)
    if (pendingFeedNode && localProject) {
      const ports = createPortsForType('Feed');
      const newNode: UnitOpNode = {
        id: pendingFeedNode.nodeId,
        type: 'Feed',
        name: `Feed-${localProject.flowsheet.nodes.length + 1}`,
        params: {},
        ports,
      };

      const updatedProject: JasperProject = {
        ...localProject,
        flowsheet: {
          ...localProject.flowsheet,
          nodes: [...localProject.flowsheet.nodes, newNode],
          layout: {
            ...localProject.flowsheet.layout,
            nodes: {
              ...localProject.flowsheet.layout?.nodes,
              [pendingFeedNode.nodeId]: {
                x: pendingFeedNode.position.x,
                y: pendingFeedNode.position.y,
              },
            },
          },
        },
      };

      updateProject(updatedProject);
      setSelectedNode(pendingFeedNode.nodeId);
    }

    setPendingFeedNode(null);
    setShowComponentPicker(false);
  }, [pendingFeedNode, localProject, createPortsForType, updateProject, setSelectedNode]);

  const handleRunSimulation = useCallback(() => {
    if (!localProject) return;
    const versionId = localProject.latestVersionId || generateId('ver');
    runMutation.mutate(versionId);
  }, [localProject, runMutation]);

  const handleSaveVersion = useCallback(() => {
    if (!localProject) return;
    const label = prompt('Version label:', `v${Date.now()}`);
    if (label) {
      versionMutation.mutate(label);
    }
  }, [localProject, versionMutation]);

  if (isLoading || !localProject) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="island p-8 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <div className="text-sm font-medium text-muted-foreground">Loading project...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background overflow-hidden text-foreground">
      
      {/* Canvas Layer - Full screen */}
      <div className="absolute inset-0">
        <PfdCanvas
          graph={localProject.flowsheet}
          onGraphChange={handleGraphChange}
          onDropNode={handleAddNode}
          components={localProject.components}
        />
      </div>

      {/* Floating UI Layer */}
      
      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <TopBar 
            projectName={localProject.name} 
            status={localProject.status} 
            onSaveVersion={handleSaveVersion}
            onRunSimulation={handleRunSimulation}
            isSimulating={runMutation.isPending}
          />
        </div>
      </div>

      {/* Left Side - SideNav */}
      <div className="absolute left-4 top-20 z-40 pointer-events-none">
        <div className="pointer-events-auto">
          <SideNav
            projectId={localProject.projectId}
            onRunSelect={(runId) => setLatestRunId(runId)}
          />
        </div>
      </div>

      {/* Right Side - Inspector */}
      <div className="absolute right-4 top-20 bottom-20 z-40 pointer-events-none">
        <div className="pointer-events-auto h-full">
          <Inspector
            project={localProject}
            onProjectChange={updateProject}
            selectedNodeId={selectedNodeId}
            selectedStreamId={selectedStreamId}
            latestRunId={latestRunId}
            onOpenComponentPicker={() => setShowComponentPicker(true)}
          />
        </div>
      </div>

      {/* Bottom Center - Equipment Toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <BottomToolbar onAddNode={handleAddNode} />
        </div>
      </div>

      {/* Bottom Left - Console */}
      <div className="absolute bottom-6 left-24 z-40 pointer-events-auto">
        <ConsoleDrawer projectId={localProject.projectId} latestRunId={latestRunId} />
      </div>

      {/* Component Picker Modal */}
      <ComponentPickerModal
        isOpen={showComponentPicker}
        onClose={handleCloseComponentPicker}
        onSelectComponents={handleSelectComponents}
        existingComponents={localProject.components}
      />
    </div>
  );
}
