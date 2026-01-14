import { useCallback, useRef, useEffect, useState } from 'react';
import type { DragEvent } from 'react';
import ReactFlow, {
  Background,
  Controls,
  // MiniMap, // Disabled to reduce memory usage in Safari
  MarkerType,
  BackgroundVariant,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import type { 
  ReactFlowInstance, 
  Node, 
  Edge, 
  Connection, 
  XYPosition,
  NodeChange,
  EdgeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useEditorStore } from '../../store/editorStore';
import type { FlowsheetGraph, StreamEdge, UnitType } from '../../core/schema';
import { nodeTypes } from './CustomNodes';

interface PfdCanvasProps {
  graph: FlowsheetGraph;
  onGraphChange: (graph: FlowsheetGraph) => void;
  onDropNode?: (type: UnitType, position: XYPosition) => void;
}

// Convert graph to React Flow format
// Each block in our flowsheet becomes a visual node
function graphToNodes(graph: FlowsheetGraph): Node[] {
  return graph.nodes.map((block) => {
    const layoutPos = graph.layout?.nodes[block.id];
    return {
      id: block.id, // Use block ID directly - single source of truth
      type: block.type,
      position: layoutPos && typeof layoutPos.x === 'number' && typeof layoutPos.y === 'number'
        ? { x: layoutPos.x, y: layoutPos.y }
        : { x: 200 + Math.random() * 200, y: 150 + Math.random() * 150 },
      data: { 
        label: block.name, 
        node: block, // Keep reference to the data block
        type: block.type 
      },
      // Make nodes selectable
      selectable: true,
      draggable: true,
    };
  });
}

function graphToEdges(graph: FlowsheetGraph): Edge[] {
  // Filter out edges that reference non-existent blocks
  const blockIds = new Set(graph.nodes.map(n => n.id));
  
  return graph.edges
    .filter(stream => blockIds.has(stream.from.nodeId) && blockIds.has(stream.to.nodeId))
    .map((stream) => ({
      id: stream.id, // Stream ID is the edge ID
      source: stream.from.nodeId, // Connect from source block
      sourceHandle: stream.from.portName || null,
      target: stream.to.nodeId, // Connect to target block
      targetHandle: stream.to.portName || null,
      label: stream.name,
      type: 'smoothstep',
      // Make edges selectable
      selectable: true,
      markerEnd: { 
        type: MarkerType.ArrowClosed, 
        color: 'hsl(var(--stream-color))',
        width: 14,
        height: 14,
      },
      style: { 
        stroke: 'hsl(var(--stream-color))', 
        strokeWidth: 2,
      },
      labelStyle: { 
        fill: 'hsl(var(--foreground))', 
        fontWeight: 500,
        fontSize: 10,
      },
      labelBgStyle: { 
        fill: 'hsl(var(--card))', 
        fillOpacity: 0.95,
        rx: 4,
        ry: 4,
      },
      labelBgPadding: [6, 4] as [number, number],
    }));
}

export default function PfdCanvas({ graph, onGraphChange, onDropNode }: PfdCanvasProps) {
  const { setSelectedNode, setSelectedStream } = useEditorStore();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const [initialized, setInitialized] = useState(false);
  
  // Local React Flow state - visual representation of blocks and streams
  const [nodes, setNodes] = useState<Node[]>(() => graphToNodes(graph));
  const [edges, setEdges] = useState<Edge[]>(() => graphToEdges(graph));
  
  // Track graph changes to sync visual layer
  const prevNodeCount = useRef(graph.nodes.length);
  const prevEdgeCount = useRef(graph.edges.length);
  
  // Sync external graph changes (like adding new nodes)
  useEffect(() => {
    const nodeCountChanged = graph.nodes.length !== prevNodeCount.current;
    const edgeCountChanged = graph.edges.length !== prevEdgeCount.current;
    
    if (nodeCountChanged) {
      // New nodes added - merge with existing positions
      const newNodes = graphToNodes(graph);
      setNodes(currentNodes => {
        // Keep existing node positions, add new ones
        const existingPositions = new Map(currentNodes.map(n => [n.id, n.position]));
        return newNodes.map(node => ({
          ...node,
          position: existingPositions.get(node.id) || node.position,
        }));
      });
      prevNodeCount.current = graph.nodes.length;
    }
    
    if (edgeCountChanged) {
      setEdges(graphToEdges(graph));
      prevEdgeCount.current = graph.edges.length;
    }
  }, [graph]);

  // Handle node changes (dragging, selecting)
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes(nds => applyNodeChanges(changes, nds));
  }, []);

  // Handle edge changes
  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges(eds => applyEdgeChanges(changes, eds));
  }, []);

  // Save node positions after drag
  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      // Update the graph layout with new position
      const updatedGraph: FlowsheetGraph = {
        ...graph,
        layout: {
          ...graph.layout,
          nodes: {
            ...graph.layout?.nodes,
            [node.id]: { x: node.position.x, y: node.position.y },
          },
        },
      };
      onGraphChange(updatedGraph);
    },
    [graph, onGraphChange]
  );

  // Handle connections
  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      // Prevent self-connections
      if (connection.source === connection.target) return;

      const sourceNode = graph.nodes.find((n) => n.id === connection.source);
      const targetNode = graph.nodes.find((n) => n.id === connection.target);
      if (!sourceNode || !targetNode) return;

      // Find appropriate port names
      // Handle ID in React Flow matches our port name (e.g., "out", "in", "gas-in", etc.)
      let sourcePortName = connection.sourceHandle;
      let targetPortName = connection.targetHandle;
      
      // Fallback: if no handle specified, find first available port
      if (!sourcePortName) {
        const outPort = sourceNode.ports.find(p => p.direction === 'out');
        sourcePortName = outPort?.name || 'out';
      }
      
      if (!targetPortName) {
        const inPort = targetNode.ports.find(p => p.direction === 'in');
        targetPortName = inPort?.name || 'in';
      }

      // Check if this connection already exists
      const connectionExists = graph.edges.some(
        e => e.from.nodeId === connection.source && 
             e.from.portName === sourcePortName &&
             e.to.nodeId === connection.target &&
             e.to.portName === targetPortName
      );
      if (connectionExists) return;

      const newStreamEdge: StreamEdge = {
        id: `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `S${graph.edges.length + 1}`,
        from: { nodeId: connection.source, portName: sourcePortName },
        to: { nodeId: connection.target, portName: targetPortName },
      };

      // Update graph with new edge
      const updatedGraph: FlowsheetGraph = {
        ...graph,
        edges: [...graph.edges, newStreamEdge],
      };
      onGraphChange(updatedGraph);
    },
    [graph, onGraphChange]
  );

  // Drag and drop from toolbar
  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as UnitType;
      if (!type || !reactFlowInstance.current || !reactFlowWrapper.current) return;

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      if (onDropNode) {
        onDropNode(type, position);
      }
    },
    [onDropNode]
  );

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
    if (!initialized) {
      // Fit view only on first init
      setTimeout(() => {
        instance.fitView({ padding: 0.2 });
        setInitialized(true);
      }, 100);
    }
  }, [initialized]);

  // Block selection handler
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  // Stream selection handler
  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      setSelectedStream(edge.id);
    },
    [setSelectedStream]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedStream(null);
  }, [setSelectedNode, setSelectedStream]);

  // Delete handlers
  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      const deletedIds = new Set(deleted.map(n => n.id));
      const updatedGraph: FlowsheetGraph = {
        ...graph,
        nodes: graph.nodes.filter((n) => !deletedIds.has(n.id)),
        edges: graph.edges.filter(
          (e) => !deletedIds.has(e.from.nodeId) && !deletedIds.has(e.to.nodeId)
        ),
        layout: {
          ...graph.layout,
          nodes: Object.fromEntries(
            Object.entries(graph.layout?.nodes || {}).filter(([id]) => !deletedIds.has(id))
          ),
        },
      };
      onGraphChange(updatedGraph);
      setSelectedNode(null);
    },
    [graph, onGraphChange, setSelectedNode]
  );

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      const deletedIds = new Set(deleted.map(e => e.id));
      const updatedGraph: FlowsheetGraph = {
        ...graph,
        edges: graph.edges.filter((e) => !deletedIds.has(e.id)),
      };
      onGraphChange(updatedGraph);
      setSelectedStream(null);
    },
    [graph, onGraphChange, setSelectedStream]
  );

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={onPaneClick}
        onInit={onInit}
        onDragOver={onDragOver}
        onDrop={onDrop}
        proOptions={{ hideAttribution: true }}
        className="bg-transparent"
        deleteKeyCode={['Backspace', 'Delete']}
        selectionKeyCode={['Shift']}
        multiSelectionKeyCode={['Meta', 'Control']}
        defaultEdgeOptions={{
          type: 'smoothstep',
        }}
        connectionLineStyle={{ stroke: 'hsl(var(--stream-color))', strokeWidth: 2 }}
        snapToGrid
        snapGrid={[12, 12]}
      >
        <Background 
          variant={BackgroundVariant.Dots}
          color="hsl(var(--canvas-dot))" 
          gap={24} 
          size={1.5}
        />
        <Controls 
          className="!bg-card !border !border-border !rounded-xl !shadow-lg overflow-hidden [&>button]:!bg-card [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-muted"
          showInteractive={false}
        />
{/* MiniMap disabled to reduce memory usage in Safari
        <MiniMap
          className="!bg-card !border !border-border !rounded-xl !shadow-lg overflow-hidden"
          nodeColor="hsl(var(--primary))"
          maskColor="hsl(var(--background) / 0.7)"
          pannable
          zoomable
        />
        */}
      </ReactFlow>
    </div>
  );
}
