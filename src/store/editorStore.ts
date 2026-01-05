import { create } from 'zustand';

interface EditorState {
  selectedNodeId: string | null;
  selectedStreamId: string | null;
  setSelectedNode: (nodeId: string | null) => void;
  setSelectedStream: (streamId: string | null) => void;
  clearSelection: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  selectedNodeId: null,
  selectedStreamId: null,
  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId, selectedStreamId: null }),
  setSelectedStream: (streamId) => set({ selectedStreamId: streamId, selectedNodeId: null }),
  clearSelection: () => set({ selectedNodeId: null, selectedStreamId: null }),
}));

