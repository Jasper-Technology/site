import { useState } from 'react';
import type { DragEvent } from 'react';
import { ChevronUp, ChevronDown, Search, X } from 'lucide-react';
import type { UnitType } from '../../core/schema';

interface BottomToolbarProps {
  onAddNode: (type: UnitType, position?: { x: number; y: number }) => void;
}

// Equipment definitions with ISA 5.1 / industry standard symbols
const equipmentItems: { type: UnitType; label: string; category: string }[] = [
  // Sources
  { type: 'Feed', label: 'Feed', category: 'source' },
  // Vessels
  { type: 'Flash', label: 'Flash', category: 'vessel' },
  { type: 'Separator', label: 'Separator', category: 'vessel' },
  { type: 'Reactor', label: 'Reactor', category: 'vessel' },
  // Columns
  { type: 'Absorber', label: 'Absorber', category: 'column' },
  { type: 'Stripper', label: 'Stripper', category: 'column' },
  { type: 'DistillationColumn', label: 'Column', category: 'column' },
  // Heat Transfer
  { type: 'HeatExchanger', label: 'HX', category: 'heat' },
  { type: 'Heater', label: 'Heater', category: 'heat' },
  { type: 'Cooler', label: 'Cooler', category: 'heat' },
  // Rotating
  { type: 'Pump', label: 'Pump', category: 'rotating' },
  { type: 'Compressor', label: 'Compressor', category: 'rotating' },
  // Flow
  { type: 'Valve', label: 'Valve', category: 'flow' },
  { type: 'Mixer', label: 'Mixer', category: 'flow' },
  { type: 'Splitter', label: 'Splitter', category: 'flow' },
];

// ISA 5.1 Standard P&ID Symbol Components
const PIDSymbol = ({ type }: { type: UnitType }) => {
  const baseClass = "w-full h-full";
  
  switch (type) {
    case 'Feed':
      return (
        <svg viewBox="0 0 40 40" className={baseClass}>
          <circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" strokeWidth="2"/>
          <line x1="20" y1="6" x2="20" y2="34" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="6" y1="20" x2="34" y2="20" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      );
    
    case 'Pump':
      return (
        <svg viewBox="0 0 40 40" className={baseClass}>
          <circle cx="20" cy="20" r="12" fill="none" stroke="currentColor" strokeWidth="2"/>
          <polygon points="20,8 32,26 8,26" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    
    case 'Compressor':
      return (
        <svg viewBox="0 0 40 40" className={baseClass}>
          <circle cx="20" cy="20" r="12" fill="none" stroke="currentColor" strokeWidth="2"/>
          <polygon points="12,14 28,14 28,26 12,26" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      );
    
    case 'Valve':
      return (
        <svg viewBox="0 0 40 40" className={baseClass}>
          <polygon points="8,28 20,14 20,28" fill="none" stroke="currentColor" strokeWidth="2"/>
          <polygon points="32,28 20,14 20,28" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    
    case 'Heater':
      return (
        <svg viewBox="0 0 40 40" className={baseClass}>
          <circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M14 24 Q17 16 20 24 Q23 16 26 24" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
      );
    
    case 'Cooler':
      return (
        <svg viewBox="0 0 40 40" className={baseClass}>
          <circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" strokeWidth="2"/>
          <path d="M20 12 L20 28 M14 18 L20 12 L26 18" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
      );
    
    case 'HeatExchanger':
      return (
        <svg viewBox="0 0 40 40" className={baseClass}>
          <ellipse cx="10" cy="20" rx="4" ry="12" fill="none" stroke="currentColor" strokeWidth="2"/>
          <ellipse cx="30" cy="20" rx="4" ry="12" fill="none" stroke="currentColor" strokeWidth="2"/>
          <line x1="14" y1="8" x2="26" y2="8" stroke="currentColor" strokeWidth="2"/>
          <line x1="14" y1="32" x2="26" y2="32" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    
    case 'Flash':
    case 'Separator':
      return (
        <svg viewBox="0 0 40 40" className={baseClass}>
          <ellipse cx="20" cy="8" rx="12" ry="4" fill="none" stroke="currentColor" strokeWidth="2"/>
          <ellipse cx="20" cy="32" rx="12" ry="4" fill="none" stroke="currentColor" strokeWidth="2"/>
          <line x1="8" y1="8" x2="8" y2="32" stroke="currentColor" strokeWidth="2"/>
          <line x1="32" y1="8" x2="32" y2="32" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    
    case 'Absorber':
    case 'Stripper':
    case 'DistillationColumn':
      return (
        <svg viewBox="0 0 40 40" className={baseClass}>
          <rect x="12" y="4" width="16" height="32" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
          <line x1="14" y1="12" x2="26" y2="12" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
          <line x1="14" y1="20" x2="26" y2="20" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
          <line x1="14" y1="28" x2="26" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
        </svg>
      );
    
    case 'Reactor':
      return (
        <svg viewBox="0 0 40 40" className={baseClass}>
          <rect x="10" y="8" width="20" height="26" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
          <line x1="20" y1="2" x2="20" y2="18" stroke="currentColor" strokeWidth="2"/>
          <line x1="14" y1="22" x2="26" y2="22" stroke="currentColor" strokeWidth="2"/>
          <line x1="14" y1="28" x2="26" y2="28" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    
    case 'Mixer':
      return (
        <svg viewBox="0 0 40 40" className={baseClass}>
          <circle cx="20" cy="20" r="12" fill="none" stroke="currentColor" strokeWidth="2"/>
          <line x1="12" y1="12" x2="28" y2="28" stroke="currentColor" strokeWidth="2"/>
          <line x1="28" y1="12" x2="12" y2="28" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    
    case 'Splitter':
      return (
        <svg viewBox="0 0 40 40" className={baseClass}>
          <circle cx="20" cy="20" r="12" fill="none" stroke="currentColor" strokeWidth="2"/>
          <line x1="10" y1="20" x2="20" y2="20" stroke="currentColor" strokeWidth="2"/>
          <line x1="20" y1="20" x2="30" y2="12" stroke="currentColor" strokeWidth="2"/>
          <line x1="20" y1="20" x2="30" y2="28" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
    
    default:
      return (
        <svg viewBox="0 0 40 40" className={baseClass}>
          <rect x="8" y="8" width="24" height="24" rx="2" fill="none" stroke="currentColor" strokeWidth="2"/>
        </svg>
      );
  }
};

export default function BottomToolbar({ onAddNode }: BottomToolbarProps) {
  const [expanded, setExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDragStart = (e: DragEvent<HTMLButtonElement>, type: UnitType) => {
    e.dataTransfer.setData('application/reactflow', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  const filteredItems = searchQuery
    ? equipmentItems.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : equipmentItems;

  // Group by category for expanded view
  const categories = [
    { id: 'source', label: 'Sources' },
    { id: 'vessel', label: 'Vessels' },
    { id: 'column', label: 'Columns' },
    { id: 'heat', label: 'Heat Transfer' },
    { id: 'rotating', label: 'Rotating' },
    { id: 'flow', label: 'Flow' },
  ];

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Expanded panel */}
      {expanded && (
        <div className="island island-animate-in w-[560px] max-h-[320px] overflow-hidden">
          {/* Search header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
              autoFocus
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setExpanded(false)}
              className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Equipment grid */}
          <div className="p-3 overflow-y-auto max-h-[260px] custom-scrollbar">
            {searchQuery ? (
              <div className="grid grid-cols-8 gap-1">
                {filteredItems.map((item) => (
                  <button
                    key={item.type}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.type)}
                    onClick={() => { onAddNode(item.type); setExpanded(false); }}
                    className="flex flex-col items-center p-2 rounded-lg hover:bg-muted/60 cursor-grab active:cursor-grabbing transition-colors group"
                    title={`Drag ${item.label} to canvas`}
                  >
                    <div className="w-8 h-8 text-muted-foreground group-hover:text-foreground transition-colors">
                      <PIDSymbol type={item.type} />
                    </div>
                    <span className="text-[9px] text-muted-foreground group-hover:text-foreground mt-1 truncate w-full text-center">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((cat) => {
                  const items = equipmentItems.filter(i => i.category === cat.id);
                  if (items.length === 0) return null;
                  return (
                    <div key={cat.id}>
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-1 mb-1.5">
                        {cat.label}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {items.map((item) => (
                          <button
                            key={item.type}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item.type)}
                            onClick={() => { onAddNode(item.type); setExpanded(false); }}
                            className="flex flex-col items-center p-2 rounded-lg hover:bg-muted/60 cursor-grab active:cursor-grabbing transition-colors group"
                            title={`Drag ${item.label} to canvas`}
                          >
                            <div className="w-8 h-8 text-muted-foreground group-hover:text-foreground transition-colors">
                              <PIDSymbol type={item.type} />
                            </div>
                            <span className="text-[9px] text-muted-foreground group-hover:text-foreground mt-1">
                              {item.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main toolbar */}
      <div className="island flex items-center gap-1 px-2 py-2">
        {/* Quick access - most common items */}
        {equipmentItems.slice(0, 10).map((item) => (
          <button
            key={item.type}
            draggable
            onDragStart={(e) => handleDragStart(e, item.type)}
            onClick={() => onAddNode(item.type)}
            className="toolbar-btn group relative cursor-grab active:cursor-grabbing"
            title={`${item.label} - Drag or click to add`}
          >
            <div className="w-5 h-5">
              <PIDSymbol type={item.type} />
            </div>
            {/* Tooltip */}
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-foreground text-background text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              {item.label}
            </span>
          </button>
        ))}

        <div className="w-px h-6 bg-border mx-1" />

        {/* Expand button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={`toolbar-btn ${expanded ? 'toolbar-btn-active' : ''}`}
          title="All equipment"
        >
          <ChevronUp className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );
}

