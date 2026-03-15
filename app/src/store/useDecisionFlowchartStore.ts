import { create } from 'zustand';
import type {
  DecisionNode,
  DecisionEdge,
  DecisionFlowchartMetadata,
} from '../types/decisionFlowchart';
import * as storage from '../lib/decisionFlowchartStorage';
import { saveLastSession } from './useStore';

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

  // Actions - Flowchart management (async)
  loadFlowchartList: () => Promise<void>;
  createNewFlowchart: () => void;
  saveFlowchart: (naam: string, beschrijving?: string) => Promise<void>;
  saveFlowchartAs: (naam: string, beschrijving?: string) => Promise<void>;
  loadFlowchart: (id: string) => Promise<void>;
  deleteFlowchart: (id: string) => Promise<void>;
  autoSave: () => Promise<void>;

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

  _saveToHistory: () => {
    const state = get();
    const currentSnapshot = { nodes: [...state.nodes], edges: [...state.edges] };

    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(currentSnapshot);
      if (newHistory.length > 3) newHistory.shift();
      return { history: newHistory, historyIndex: newHistory.length - 1 };
    });
  },

  // Data actions
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addNode: (node) => {
    get()._saveToHistory();
    set((state) => ({ nodes: [...state.nodes, node] }));
    setTimeout(() => get().autoSave(), 100);
  },

  updateNode: (id, updates) => {
    set((state) => ({
      nodes: state.nodes.map((node) => node.id === id ? { ...node, ...updates } : node),
      selectedNode: state.selectedNode?.id === id
        ? { ...state.selectedNode, ...updates }
        : state.selectedNode,
    }));
    setTimeout(() => get().autoSave(), 500);
  },

  deleteNode: (id) => {
    get()._saveToHistory();
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter((edge) => edge.van !== id && edge.naar !== id),
      selectedNode: state.selectedNode?.id === id ? null : state.selectedNode,
    }));
    setTimeout(() => get().autoSave(), 100);
  },

  addEdge: (edge) => {
    get()._saveToHistory();
    set((state) => ({ edges: [...state.edges, edge] }));
    setTimeout(() => get().autoSave(), 100);
  },

  updateEdge: (id, updates) =>
    set((state) => ({
      edges: state.edges.map((edge) => edge.id === id ? { ...edge, ...updates } : edge),
    })),

  deleteEdge: (id) => {
    get()._saveToHistory();
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
      selectedEdgeId: state.selectedEdgeId === id ? null : state.selectedEdgeId,
    }));
    setTimeout(() => get().autoSave(), 100);
  },

  // UI actions
  setSelectedNode: (node) => set({ selectedNode: node, selectedEdgeId: null }),
  setSelectedEdge: (edgeId) => set({ selectedEdgeId: edgeId, selectedNode: null }),

  // Flowchart management (async)
  loadFlowchartList: async () => {
    const list = await storage.getFlowchartMetadataList();
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

  saveFlowchart: async (naam, beschrijving) => {
    const state = get();
    if (state.activeFlowchartId) {
      await storage.updateFlowchart(state.activeFlowchartId, state.nodes, state.edges, naam, beschrijving);
      saveLastSession({ view: 'decision', id: state.activeFlowchartId });
    } else {
      const newFlowchart = await storage.saveNewFlowchart(naam, state.nodes, state.edges, beschrijving);
      set({ activeFlowchartId: newFlowchart.id });
      saveLastSession({ view: 'decision', id: newFlowchart.id });
    }
    const list = await storage.getFlowchartMetadataList();
    set({ activeFlowchartName: naam, flowchartList: list });
  },

  saveFlowchartAs: async (naam, beschrijving) => {
    const state = get();
    const newFlowchart = await storage.saveNewFlowchart(naam, state.nodes, state.edges, beschrijving);
    const list = await storage.getFlowchartMetadataList();
    set({ activeFlowchartId: newFlowchart.id, activeFlowchartName: newFlowchart.naam, flowchartList: list });
    saveLastSession({ view: 'decision', id: newFlowchart.id });
  },

  loadFlowchart: async (id) => {
    const flowchart = await storage.getFlowchart(id);
    if (flowchart) {
      set({
        nodes: flowchart.nodes,
        edges: flowchart.edges,
        activeFlowchartId: flowchart.id,
        activeFlowchartName: flowchart.naam,
        selectedNode: null,
        selectedEdgeId: null,
      });
      saveLastSession({ view: 'decision', id: flowchart.id });
    }
  },

  deleteFlowchart: async (id) => {
    await storage.deleteFlowchart(id);
    const list = await storage.getFlowchartMetadataList();
    const state = get();
    if (state.activeFlowchartId === id) {
      set({
        flowchartList: list,
        nodes: [],
        edges: [],
        activeFlowchartId: null,
        activeFlowchartName: null,
        selectedNode: null,
        selectedEdgeId: null,
      });
    } else {
      set({ flowchartList: list });
    }
  },

  autoSave: async () => {
    const state = get();
    if (state.activeFlowchartId && state.activeFlowchartName) {
      await storage.updateFlowchart(
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

  canUndo: () => get().historyIndex > 0,
}));

// Selector hooks
export const useDecisionNodes = () => useDecisionFlowchartStore((state) => state.nodes);
export const useDecisionEdges = () => useDecisionFlowchartStore((state) => state.edges);
export const useSelectedDecisionNode = () => useDecisionFlowchartStore((state) => state.selectedNode);
