import { useState, useMemo, useCallback, useEffect } from 'react';
import { X, Search, Check, ChevronDown, ChevronRight, Info, Trash2 } from 'lucide-react';
import type { Component } from '../../core/schema';
import {
  COMPONENT_DATABASE,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  searchComponents,
  type ComponentData,
  type ComponentCategory,
} from '../../sim/thermo/componentDatabase';

interface ComponentPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectComponents: (components: Component[]) => void;
  existingComponents?: Component[];
  isNewFeed?: boolean; // If true, don't pre-select existing components
  onDeleteComponent?: (componentId: string) => void; // Callback to delete a component
}

export default function ComponentPickerModal({
  isOpen,
  onClose,
  onSelectComponents,
  existingComponents = [],
  isNewFeed = false,
  onDeleteComponent,
}: ComponentPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<ComponentCategory>>(
    new Set(CATEGORY_ORDER)
  );

  // Initialize selected IDs from existing components (only if not a new Feed)
  useEffect(() => {
    if (isOpen) {
      if (isNewFeed) {
        // For new Feed, start with empty selection
        setSelectedIds(new Set());
      } else {
        // For adding components to project, pre-select existing ones
        const existingIds = new Set(existingComponents.map(c => c.id));
        setSelectedIds(existingIds);
      }
    }
  }, [isOpen, existingComponents, isNewFeed]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Get filtered components as array
  const filteredComponents = useMemo((): ComponentData[] => {
    if (!searchQuery.trim()) {
      return Object.values(COMPONENT_DATABASE);
    }
    return searchComponents(searchQuery);
  }, [searchQuery]);

  // Group filtered components by category
  const groupedComponents = useMemo(() => {
    const grouped = new Map<ComponentCategory, ComponentData[]>();

    for (const category of CATEGORY_ORDER) {
      grouped.set(category, []);
    }

    for (const component of filteredComponents) {
      const list = grouped.get(component.category);
      if (list) {
        list.push(component);
      }
    }

    // Remove empty categories
    for (const [category, components] of grouped) {
      if (components.length === 0) {
        grouped.delete(category);
      }
    }

    return grouped;
  }, [filteredComponents]);

  const toggleComponent = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleCategory = useCallback((category: ComponentCategory) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    const allIds = new Set(filteredComponents.map((c: ComponentData) => c.id));
    setSelectedIds(allIds);
  }, [filteredComponents]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleAddSelected = useCallback(() => {
    const selectedComponents: Component[] = [];

    for (const comp of Object.values(COMPONENT_DATABASE)) {
      if (selectedIds.has(comp.id)) {
        selectedComponents.push({
          id: comp.id,
          name: comp.name,
          formula: comp.formula,
          cas: comp.cas,
        });
      }
    }

    // Only call onSelectComponents - it will close the modal itself
    // Don't call onClose() here as that triggers the "skip" logic
    onSelectComponents(selectedComponents);
  }, [selectedIds, onSelectComponents]);

  const handleSkip = useCallback(() => {
    onClose();
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[85vh] mx-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden island-animate-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Select Components
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Choose chemical components for your simulation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, formula, or CAS number..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              autoFocus
            />
          </div>

          {/* Selection controls */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <button
                onClick={selectAll}
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Select All
              </button>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <button
                onClick={clearSelection}
                className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                Clear
              </button>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {selectedIds.size} selected
              {filteredComponents.length !== Object.keys(COMPONENT_DATABASE).length && (
                <span className="ml-1">
                  ({filteredComponents.length} matches)
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Existing Components Section */}
        {existingComponents.length > 0 && !isNewFeed && (
          <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Project Components
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {existingComponents.length} component{existingComponents.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {existingComponents.map(comp => {
                const compData = COMPONENT_DATABASE[comp.id];
                return (
                  <div
                    key={comp.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg"
                  >
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                      {comp.name} ({comp.id})
                    </span>
                    {onDeleteComponent && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Remove ${comp.name} from project? This will also remove it from all Feed compositions.`)) {
                            onDeleteComponent(comp.id);
                          }
                        }}
                        className="p-0.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title={`Delete ${comp.name}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Component List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4">
          {groupedComponents.size === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                No components found
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Try a different search term
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {Array.from(groupedComponents.entries()).map(([category, components]) => (
                <div key={category} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {expandedCategories.has(category) ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {CATEGORY_LABELS[category]}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {components.filter(c => selectedIds.has(c.id)).length} / {components.length}
                    </span>
                  </button>

                  {/* Component Items */}
                  {expandedCategories.has(category) && (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {components.map(comp => {
                        const isSelected = selectedIds.has(comp.id);
                        const isExisting = existingComponents.some(c => c.id === comp.id);

                        return (
                          <button
                            key={comp.id}
                            onClick={() => toggleComponent(comp.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                              isSelected
                                ? 'bg-primary/5 dark:bg-primary/10'
                                : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                            }`}
                          >
                            {/* Checkbox */}
                            <div
                              className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'bg-primary border-primary'
                                  : 'border-slate-300 dark:border-slate-600'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>

                            {/* Component Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                  {comp.name}
                                </span>
                                {isExisting && (
                                  <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-300 rounded">
                                    Added
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-0.5">
                                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                  {comp.formula}
                                </span>
                                <span className="text-xs text-slate-400 dark:text-slate-500">
                                  MW: {comp.MW.toFixed(2)}
                                </span>
                                {comp.cas && (
                                  <span className="text-xs text-slate-400 dark:text-slate-500">
                                    CAS: {comp.cas}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Components define the chemical species in your simulation. You can add more components later from the project settings.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <button
            onClick={handleSkip}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Skip for now
          </button>

          <button
            onClick={handleAddSelected}
            disabled={selectedIds.size === 0}
            className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
              selectedIds.size > 0
                ? 'bg-primary text-white hover:bg-primary/90 active:scale-[0.98]'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
            }`}
          >
            Add Selected
            {selectedIds.size > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs font-bold bg-white/20 rounded">
                {selectedIds.size}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
