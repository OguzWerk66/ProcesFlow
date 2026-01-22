import { create } from 'zustand';
import type {
  DecisionNode,
  DecisionEdge,
  DecisionFlowchartMetadata,
} from '../types/decisionFlowchart';
import * as storage from '../lib/decisionFlowchartStorage';

interface DecisionFlowchartState {
  // Data
  nodes: DecisionNode[];
  edges: DecisionEdge[];

  // UI State
  selectedNode: DecisionNode | null;
  selectedEdgeId: string | null;

  // Undo system
  history: Array<{ nodes: DecisionNode[]; edges: DecisionEdge[] }>;
  historyIndex: number;

  // Flowchart management
  flowchartList: DecisionFlowchartMetadata[];
  activeFlowchartId: string | null;
  activeFlowchartName: string | null;

  // Actions - Data
  setNodes: (nodes: DecisionNode[]) => void;
  setEdges: (edges: DecisionEdge[]) => void;
  addNode: (node: DecisionNode) => void;
  updateNode: (id: string, updates: Partial<DecisionNode>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: DecisionEdge) => void;
  updateEdge: (id: string, updates: Partial<DecisionEdge>) => void;
  deleteEdge: (id: string) => void;

  // Actions - UI
  setSelectedNode: (node: DecisionNode | null) => void;
  setSelectedEdge: (edgeId: string | null) => void;

  // Actions - Flowchart management
  loadFlowchartList: () => void;
  createNewFlowchart: () => void;
  saveFlowchart: (naam: string, beschrijving?: string) => void;
  saveFlowchartAs: (naam: string, beschrijving?: string) => void;
  loadFlowchart: (id: string) => void;
  deleteFlowchart: (id: string) => void;
  autoSave: () => void;

  // Actions - Undo system
  undo: () => void;
  canUndo: () => boolean;
  _saveToHistory: () => void;
}

export const useDecisionFlowchartStore = create<DecisionFlowchartState>((set, get) => ({
  // Initial state
  nodes: [],
  edges: [],
  selectedNode: null,
  selectedEdgeId: null,
  history: [],
  historyIndex: -1,
  flowchartList: [],
  activeFlowchartId: null,
  activeFlowchartName: null,

  // Helper function to save state to history
  _saveToHistory: () => {
    const state = get();
    const currentSnapshot = { nodes: [...state.nodes], edges: [...state.edges] };

    set((state) => {
      // Remove any history after current index (for when undoing and then making new changes)
      const newHistory = state.history.slice(0, state.historyIndex + 1);

      // Add current state to history
      newHistory.push(currentSnapshot);

      // Keep only last 3 states
      if (newHistory.length > 3) {
        newHistory.shift();
      }

      return {
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  },

  // Data actions
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addNode: (node) => {
    get()._saveToHistory();
    set((state) => ({
      nodes: [...state.nodes, node],
    }));
    // Automatisch opslaan na toevoegen
    setTimeout(() => get().autoSave(), 100);
  },

  updateNode: (id, updates) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...updates } : node
      ),
      selectedNode:
        state.selectedNode?.id === id
          ? { ...state.selectedNode, ...updates }
          : state.selectedNode,
    }));
    // Automatisch opslaan na bijwerken (met debounce)
    setTimeout(() => get().autoSave(), 500);
  },

  deleteNode: (id) => {
    get()._saveToHistory();
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter((edge) => edge.van !== id && edge.naar !== id),
      selectedNode: state.selectedNode?.id === id ? null : state.selectedNode,
    }));
    // Automatisch opslaan na verwijderen
    setTimeout(() => get().autoSave(), 100);
  },

  addEdge: (edge) => {
    get()._saveToHistory();
    set((state) => ({
      edges: [...state.edges, edge],
    }));
    // Automatisch opslaan na toevoegen
    setTimeout(() => get().autoSave(), 100);
  },

  updateEdge: (id, updates) =>
    set((state) => ({
      edges: state.edges.map((edge) =>
        edge.id === id ? { ...edge, ...updates } : edge
      ),
    })),

  deleteEdge: (id) => {
    get()._saveToHistory();
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
      selectedEdgeId: state.selectedEdgeId === id ? null : state.selectedEdgeId,
    }));
    // Automatisch opslaan na verwijderen
    setTimeout(() => get().autoSave(), 100);
  },

  // UI actions
  setSelectedNode: (node) =>
    set({
      selectedNode: node,
      selectedEdgeId: null,
    }),

  setSelectedEdge: (edgeId) =>
    set({
      selectedEdgeId: edgeId,
      selectedNode: null,
    }),

  // Flowchart management
  loadFlowchartList: () => {
    const list = storage.getFlowchartMetadataList();
    set({ flowchartList: list });
  },

  createNewFlowchart: () =>
    set({
      nodes: [],
      edges: [],
      selectedNode: null,
      selectedEdgeId: null,
      activeFlowchartId: null,
      activeFlowchartName: null,
    }),

  saveFlowchart: (naam, beschrijving) => {
    const state = get();
    if (state.activeFlowchartId) {
      // Update bestaand
      storage.updateFlowchart(
        state.activeFlowchartId,
        state.nodes,
        state.edges,
        naam,
        beschrijving
      );
      set({
        activeFlowchartName: naam,
        flowchartList: storage.getFlowchartMetadataList(),
      });
    } else {
      // Nieuw opslaan
      const newFlowchart = storage.saveNewFlowchart(
        naam,
        state.nodes,
        state.edges,
        beschrijving
      );
      set({
        activeFlowchartId: newFlowchart.id,
        activeFlowchartName: newFlowchart.naam,
        flowchartList: storage.getFlowchartMetadataList(),
      });
    }
  },

  saveFlowchartAs: (naam, beschrijving) => {
    const state = get();
    const newFlowchart = storage.saveNewFlowchart(
      naam,
      state.nodes,
      state.edges,
      beschrijving
    );
    set({
      activeFlowchartId: newFlowchart.id,
      activeFlowchartName: newFlowchart.naam,
      flowchartList: storage.getFlowchartMetadataList(),
    });
  },

  loadFlowchart: (id) => {
    const flowchart = storage.getFlowchart(id);
    if (flowchart) {
      set({
        nodes: flowchart.nodes,
        edges: flowchart.edges,
        activeFlowchartId: flowchart.id,
        activeFlowchartName: flowchart.naam,
        selectedNode: null,
        selectedEdgeId: null,
      });
    }
  },

  deleteFlowchart: (id) => {
    storage.deleteFlowchart(id);
    const state = get();
    const newList = storage.getFlowchartMetadataList();

    if (state.activeFlowchartId === id) {
      set({
        flowchartList: newList,
        nodes: [],
        edges: [],
        activeFlowchartId: null,
        activeFlowchartName: null,
        selectedNode: null,
        selectedEdgeId: null,
      });
    } else {
      set({ flowchartList: newList });
    }
  },

  autoSave: () => {
    const state = get();
    if (state.activeFlowchartId && state.activeFlowchartName) {
      // Automatisch opslaan als er een actief flowchart is
      storage.updateFlowchart(
        state.activeFlowchartId,
        state.nodes,
        state.edges,
        state.activeFlowchartName
      );
    }
  },

  // Undo system
  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const previousState = state.history[state.historyIndex - 1];
      set({
        nodes: previousState.nodes,
        edges: previousState.edges,
        historyIndex: state.historyIndex - 1,
        selectedNode: null,
        selectedEdgeId: null,
      });
    }
  },

  canUndo: () => {
    const state = get();
    return state.historyIndex > 0;
  },
}));

// Selector hooks
export const useDecisionNodes = () =>
  useDecisionFlowchartStore((state) => state.nodes);
export const useDecisionEdges = () =>
  useDecisionFlowchartStore((state) => state.edges);
export const useSelectedDecisionNode = () =>
  useDecisionFlowchartStore((state) => state.selectedNode);
