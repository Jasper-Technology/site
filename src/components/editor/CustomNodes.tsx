import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { UnitType } from '../../core/schema';

interface CustomNodeData {
  label: string;
  node: any;
  type: UnitType;
}

// Handle styling
const handleStyle = {
  width: 8,
  height: 8,
  background: 'hsl(var(--primary))',
  border: '2px solid hsl(var(--card))',
};

// Label component
const NodeLabel = ({ label }: { label: string }) => (
  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-foreground">
    {label}
  </div>
);

// Base wrapper for all nodes
const NodeWrapper = ({ children, selected }: { children: React.ReactNode; selected?: boolean }) => (
  <div className={`relative ${selected ? 'drop-shadow-[0_0_6px_rgba(139,92,246,0.6)]' : ''}`}>
    {children}
  </div>
);

// ============================================
// ISA 5.1 / Industry Standard P&ID Symbols
// ============================================

// Feed/Source - can also act as outlet when needed
export const FeedNode = memo(({ data, selected }: NodeProps<CustomNodeData>) => (
  <NodeWrapper selected={selected}>
    <svg width="48" height="48" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="18" className="fill-card stroke-foreground" strokeWidth="2"/>
      <line x1="24" y1="6" x2="24" y2="42" className="stroke-foreground" strokeWidth="1.5"/>
      <line x1="6" y1="24" x2="42" y2="24" className="stroke-foreground" strokeWidth="1.5"/>
    </svg>
    <NodeLabel label={data.label} />
    {/* Supports both input (for use as outlet) and output (for use as source) */}
    <Handle type="target" position={Position.Left} id="in" style={handleStyle} />
    <Handle type="source" position={Position.Right} id="out" style={handleStyle} />
  </NodeWrapper>
));

export const PumpNode = memo(({ data, selected }: NodeProps<CustomNodeData>) => (
  <NodeWrapper selected={selected}>
    <svg width="48" height="48" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="16" className="fill-card stroke-foreground" strokeWidth="2"/>
      <polygon points="24,8 40,32 8,32" className="fill-none stroke-foreground" strokeWidth="2"/>
    </svg>
    <NodeLabel label={data.label} />
    <Handle type="target" position={Position.Left} id="in" style={handleStyle} />
    <Handle type="source" position={Position.Right} id="out" style={handleStyle} />
  </NodeWrapper>
));

export const CompressorNode = memo(({ data, selected }: NodeProps<CustomNodeData>) => (
  <NodeWrapper selected={selected}>
    <svg width="56" height="48" viewBox="0 0 56 48">
      <circle cx="28" cy="24" r="16" className="fill-card stroke-foreground" strokeWidth="2"/>
      <rect x="16" y="14" width="24" height="20" className="fill-none stroke-foreground" strokeWidth="1.5"/>
    </svg>
    <NodeLabel label={data.label} />
    <Handle type="target" position={Position.Left} id="in" style={handleStyle} />
    <Handle type="source" position={Position.Right} id="out" style={handleStyle} />
  </NodeWrapper>
));

export const ValveNode = memo(({ data, selected }: NodeProps<CustomNodeData>) => (
  <NodeWrapper selected={selected}>
    <svg width="40" height="36" viewBox="0 0 40 36">
      <polygon points="4,30 20,10 20,30" className="fill-card stroke-foreground" strokeWidth="2"/>
      <polygon points="36,30 20,10 20,30" className="fill-card stroke-foreground" strokeWidth="2"/>
      <line x1="20" y1="10" x2="20" y2="2" className="stroke-foreground" strokeWidth="2"/>
    </svg>
    <NodeLabel label={data.label} />
    <Handle type="target" position={Position.Left} id="in" style={{ ...handleStyle, top: '75%' }} />
    <Handle type="source" position={Position.Right} id="out" style={{ ...handleStyle, top: '75%' }} />
  </NodeWrapper>
));

export const HeaterNode = memo(({ data, selected }: NodeProps<CustomNodeData>) => (
  <NodeWrapper selected={selected}>
    <svg width="48" height="48" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="18" className="fill-card stroke-foreground" strokeWidth="2"/>
      <path d="M16 30 Q20 18 24 30 Q28 18 32 30" className="stroke-orange-500" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
    <NodeLabel label={data.label} />
    <Handle type="target" position={Position.Left} id="in" style={handleStyle} />
    <Handle type="source" position={Position.Right} id="out" style={handleStyle} />
  </NodeWrapper>
));

export const CoolerNode = memo(({ data, selected }: NodeProps<CustomNodeData>) => (
  <NodeWrapper selected={selected}>
    <svg width="48" height="48" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="18" className="fill-card stroke-foreground" strokeWidth="2"/>
      <path d="M24 12 L24 36 M16 20 L24 12 L32 20" className="stroke-blue-400" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
    <NodeLabel label={data.label} />
    <Handle type="target" position={Position.Left} id="in" style={handleStyle} />
    <Handle type="source" position={Position.Right} id="out" style={handleStyle} />
  </NodeWrapper>
));

export const HeatExchangerNode = memo(({ data, selected }: NodeProps<CustomNodeData>) => (
  <NodeWrapper selected={selected}>
    <svg width="72" height="48" viewBox="0 0 72 48">
      {/* Shell */}
      <ellipse cx="12" cy="24" rx="6" ry="18" className="fill-card stroke-foreground" strokeWidth="2"/>
      <ellipse cx="60" cy="24" rx="6" ry="18" className="fill-card stroke-foreground" strokeWidth="2"/>
      <line x1="18" y1="6" x2="54" y2="6" className="stroke-foreground" strokeWidth="2"/>
      <line x1="18" y1="42" x2="54" y2="42" className="stroke-foreground" strokeWidth="2"/>
      {/* Tubes */}
      <line x1="18" y1="16" x2="54" y2="16" className="stroke-foreground" strokeWidth="1" opacity="0.4"/>
      <line x1="18" y1="24" x2="54" y2="24" className="stroke-foreground" strokeWidth="1" opacity="0.4"/>
      <line x1="18" y1="32" x2="54" y2="32" className="stroke-foreground" strokeWidth="1" opacity="0.4"/>
    </svg>
    <NodeLabel label={data.label} />
    {/* Hot side - main left/right */}
    <Handle type="target" position={Position.Left} id="in" style={handleStyle} />
    <Handle type="source" position={Position.Right} id="out" style={handleStyle} />
    {/* Cold side - top/bottom */}
    <Handle type="target" position={Position.Top} id="cold-in" style={{ ...handleStyle, left: '30%' }} />
    <Handle type="source" position={Position.Bottom} id="cold-out" style={{ ...handleStyle, left: '70%' }} />
  </NodeWrapper>
));

export const FlashNode = memo(({ data, selected }: NodeProps<CustomNodeData>) => (
  <NodeWrapper selected={selected}>
    <svg width="56" height="72" viewBox="0 0 56 72">
      {/* Vessel */}
      <ellipse cx="28" cy="12" rx="20" ry="8" className="fill-card stroke-foreground" strokeWidth="2"/>
      <ellipse cx="28" cy="60" rx="20" ry="8" className="fill-card stroke-foreground" strokeWidth="2"/>
      <line x1="8" y1="12" x2="8" y2="60" className="stroke-foreground" strokeWidth="2"/>
      <line x1="48" y1="12" x2="48" y2="60" className="stroke-foreground" strokeWidth="2"/>
      {/* Liquid level */}
      <line x1="12" y1="40" x2="44" y2="40" className="stroke-blue-400" strokeWidth="1.5" strokeDasharray="4,2" opacity="0.6"/>
    </svg>
    <NodeLabel label={data.label} />
    <Handle type="target" position={Position.Left} id="in" style={{ ...handleStyle, top: '50%' }} />
    <Handle type="source" position={Position.Top} id="vapor" style={handleStyle} />
    <Handle type="source" position={Position.Bottom} id="liquid" style={handleStyle} />
  </NodeWrapper>
));

export const SeparatorNode = memo(({ data, selected }: NodeProps<CustomNodeData>) => (
  <NodeWrapper selected={selected}>
    <svg width="72" height="56" viewBox="0 0 72 56">
      {/* Horizontal vessel */}
      <ellipse cx="12" cy="28" rx="8" ry="20" className="fill-card stroke-foreground" strokeWidth="2"/>
      <ellipse cx="60" cy="28" rx="8" ry="20" className="fill-card stroke-foreground" strokeWidth="2"/>
      <line x1="12" y1="8" x2="60" y2="8" className="stroke-foreground" strokeWidth="2"/>
      <line x1="12" y1="48" x2="60" y2="48" className="stroke-foreground" strokeWidth="2"/>
      {/* Level */}
      <path d="M16 32 Q28 36 36 32 Q44 28 56 32" className="stroke-blue-400" strokeWidth="1.5" fill="none" opacity="0.6"/>
    </svg>
    <NodeLabel label={data.label} />
    <Handle type="target" position={Position.Left} id="in" style={handleStyle} />
    <Handle type="source" position={Position.Top} id="light" style={{ ...handleStyle, left: '70%' }} />
    <Handle type="source" position={Position.Bottom} id="heavy" style={{ ...handleStyle, left: '70%' }} />
  </NodeWrapper>
));

export const AbsorberNode = memo(({ data, selected }: NodeProps<CustomNodeData>) => (
  <NodeWrapper selected={selected}>
    <svg width="48" height="96" viewBox="0 0 48 96">
      <rect x="8" y="8" width="32" height="80" rx="4" className="fill-card stroke-foreground" strokeWidth="2"/>
      {/* Trays */}
      {[24, 36, 48, 60, 72].map((y, i) => (
        <line key={i} x1="12" y1={y} x2="36" y2={y} className="stroke-foreground" strokeWidth="1" opacity="0.4" strokeDasharray="3,2"/>
      ))}
    </svg>
    <NodeLabel label={data.label} />
    {/* Gas in at bottom left, gas out at top left */}
    <Handle type="target" position={Position.Bottom} id="gas-in" style={{ ...handleStyle, left: '30%' }} />
    <Handle type="source" position={Position.Top} id="gas-out" style={{ ...handleStyle, left: '30%' }} />
    {/* Liquid in at top right, liquid out at bottom right */}
    <Handle type="target" position={Position.Top} id="liquid-in" style={{ ...handleStyle, left: '70%' }} />
    <Handle type="source" position={Position.Bottom} id="liquid-out" style={{ ...handleStyle, left: '70%' }} />
  </NodeWrapper>
));

export const StripperNode = memo(({ data, selected }: NodeProps<CustomNodeData>) => (
  <NodeWrapper selected={selected}>
    <svg width="48" height="96" viewBox="0 0 48 96">
      <rect x="8" y="8" width="32" height="80" rx="4" className="fill-card stroke-foreground" strokeWidth="2"/>
      {/* Trays */}
      {[24, 36, 48, 60, 72].map((y, i) => (
        <line key={i} x1="12" y1={y} x2="36" y2={y} className="stroke-foreground" strokeWidth="1" opacity="0.4" strokeDasharray="3,2"/>
      ))}
      {/* Reboiler indicator */}
      <circle cx="24" cy="82" r="4" className="fill-none stroke-orange-400" strokeWidth="1.5"/>
    </svg>
    <NodeLabel label={data.label} />
    <Handle type="target" position={Position.Left} id="feed" style={{ ...handleStyle, top: '30%' }} />
    <Handle type="source" position={Position.Top} id="overhead" style={handleStyle} />
    <Handle type="source" position={Position.Bottom} id="bottoms" style={handleStyle} />
  </NodeWrapper>
));

export const DistillationColumnNode = memo(({ data, selected }: NodeProps<CustomNodeData>) => (
  <NodeWrapper selected={selected}>
    <svg width="48" height="112" viewBox="0 0 48 112">
      <rect x="8" y="16" width="32" height="80" rx="4" className="fill-card stroke-foreground" strokeWidth="2"/>
      {/* Trays */}
      {[32, 44, 56, 68, 80].map((y, i) => (
        <line key={i} x1="12" y1={y} x2="36" y2={y} className="stroke-foreground" strokeWidth="1" opacity="0.4" strokeDasharray="3,2"/>
      ))}
      {/* Condenser */}
      <rect x="14" y="4" width="20" height="8" rx="2" className="fill-card stroke-foreground" strokeWidth="1.5"/>
      {/* Reboiler */}
      <circle cx="24" cy="104" r="5" className="fill-card stroke-foreground" strokeWidth="1.5"/>
    </svg>
    <NodeLabel label={data.label} />
    <Handle type="target" position={Position.Left} id="feed" style={{ ...handleStyle, top: '45%' }} />
    <Handle type="source" position={Position.Top} id="distillate" style={handleStyle} />
    <Handle type="source" position={Position.Bottom} id="bottoms" style={handleStyle} />
  </NodeWrapper>
));

export const ReactorNode = memo(({ data, selected }: NodeProps<CustomNodeData>) => (
  <NodeWrapper selected={selected}>
    <svg width="48" height="72" viewBox="0 0 48 72">
      <rect x="8" y="12" width="32" height="52" rx="4" className="fill-card stroke-foreground" strokeWidth="2"/>
      {/* Agitator shaft */}
      <line x1="24" y1="4" x2="24" y2="36" className="stroke-foreground" strokeWidth="2"/>
      {/* Agitator blades */}
      <line x1="14" y1="40" x2="34" y2="40" className="stroke-foreground" strokeWidth="2"/>
      <line x1="14" y1="50" x2="34" y2="50" className="stroke-foreground" strokeWidth="2"/>
      {/* Motor */}
      <rect x="18" y="2" width="12" height="8" rx="2" className="fill-card stroke-foreground" strokeWidth="1.5"/>
    </svg>
    <NodeLabel label={data.label} />
    <Handle type="target" position={Position.Left} id="in" style={{ ...handleStyle, top: '50%' }} />
    <Handle type="source" position={Position.Right} id="out" style={{ ...handleStyle, top: '50%' }} />
  </NodeWrapper>
));

export const MixerNode = memo(({ data, selected }: NodeProps<CustomNodeData>) => (
  <NodeWrapper selected={selected}>
    <svg width="48" height="48" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="16" className="fill-card stroke-foreground" strokeWidth="2"/>
      <line x1="12" y1="12" x2="36" y2="36" className="stroke-foreground" strokeWidth="2"/>
      <line x1="36" y1="12" x2="12" y2="36" className="stroke-foreground" strokeWidth="2"/>
    </svg>
    <NodeLabel label={data.label} />
    <Handle type="target" position={Position.Left} id="in1" style={{ ...handleStyle, top: '35%' }} />
    <Handle type="target" position={Position.Left} id="in2" style={{ ...handleStyle, top: '65%' }} />
    <Handle type="source" position={Position.Right} id="out" style={handleStyle} />
  </NodeWrapper>
));

export const SplitterNode = memo(({ data, selected }: NodeProps<CustomNodeData>) => (
  <NodeWrapper selected={selected}>
    <svg width="48" height="48" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="16" className="fill-card stroke-foreground" strokeWidth="2"/>
      <line x1="10" y1="24" x2="24" y2="24" className="stroke-foreground" strokeWidth="2"/>
      <line x1="24" y1="24" x2="38" y2="14" className="stroke-foreground" strokeWidth="2"/>
      <line x1="24" y1="24" x2="38" y2="34" className="stroke-foreground" strokeWidth="2"/>
    </svg>
    <NodeLabel label={data.label} />
    <Handle type="target" position={Position.Left} id="in" style={handleStyle} />
    <Handle type="source" position={Position.Right} id="out1" style={{ ...handleStyle, top: '35%' }} />
    <Handle type="source" position={Position.Right} id="out2" style={{ ...handleStyle, top: '65%' }} />
  </NodeWrapper>
));

// Node type mapping
export const nodeTypes: Record<UnitType, React.ComponentType<NodeProps<CustomNodeData>>> = {
  Feed: FeedNode,
  Mixer: MixerNode,
  Splitter: SplitterNode,
  Flash: FlashNode,
  Pump: PumpNode,
  Compressor: CompressorNode,
  Valve: ValveNode,
  Heater: HeaterNode,
  Cooler: CoolerNode,
  HeatExchanger: HeatExchangerNode,
  Absorber: AbsorberNode,
  Stripper: StripperNode,
  DistillationColumn: DistillationColumnNode,
  Reactor: ReactorNode,
  Separator: SeparatorNode,
};
