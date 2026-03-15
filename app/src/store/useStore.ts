import { create } from 'zustand';
import type { ProcesNode, ProcesEdge, Module, FilterState, User, CanvasMetadata } from '../types';
import * as canvasStorage from '../lib/canvasStorage';

export const LAST_SESSION_KEY = 'procesflow_last_session';
export type LastSession = { view: 'procesflow' | 'decision'; id: string };

export function saveLastSession(session: LastSession) {
  try { localStorage.setItem(LAST_SESSION_KEY, JSON.stringify(session)); } catch { /* ignore */ }
}

export function readLastSession(): LastSession | null {
  try {
    const raw = localStorage.getItem(LAST_SESSION_KEY);
    return raw ? JSON.parse(raw) as LastSession : null;
  } catch { return null; }
}

interface HistoryEntry {
  nodes: ProcesNode[];
  edges: ProcesEdge[];
}

const MAX_HISTORY = 50;

interface AppState {
  // Data
  nodes: ProcesNode[];
  edges: ProcesEdge[];
  modules: Module[];

  // History (undo)
  history: HistoryEntry[];
  historyIndex: number;

  // UI State
  selectedNode: ProcesNode | null;
  selectedEdgeId: string | null;
  isDetailPanelOpen: boolean;
  isEditMode: boolean;
  isSidebarOpen: boolean;

  // Filters
  filters: FilterState;

  // User
  user: User | null;

  // Canvas
  canvasList: CanvasMetadata[];
  activeCanvasId: string | null;
  activeCanvasName: string | null;
  bronTekst: string | null;

  // Actions - Data
  setBronTekst: (tekst: string | null) => void;
  setNodes: (nodes: ProcesNode[]) => void;
  setEdges: (edges: ProcesEdge[]) => void;
  setModules: (modules: Module[]) => void;
  addNode: (node: ProcesNode) => void;
  updateNode: (id: string, updates: Partial<ProcesNode>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: ProcesEdge) => void;
  updateEdge: (id: string, updates: Partial<ProcesEdge>) => void;
  deleteEdge: (id: string) => void;

  // Actions - Undo
  _saveToHistory: () => void;
  undo: () => void;
  canUndo: () => boolean;

  // Actions - UI
  setSelectedNode: (node: ProcesNode | null) => void;
  setSelectedEdge: (edgeId: string | null) => void;
  openDetailPanel: () => void;
  closeDetailPanel: () => void;
  toggleEditMode: () => void;
  toggleSidebar: () => void;

  // Actions - Filters
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;

  // Actions - User
  setUser: (user: User | null) => void;

  // Actions - Canvas (async)
  loadCanvasList: () => Promise<void>;
  createNewCanvas: () => void;
  saveCanvas: (naam: string, beschrijving?: string) => Promise<void>;
  saveCanvasAs: (naam: string, beschrijving?: string) => Promise<void>;
  loadCanvas: (id: string) => Promise<void>;
  deleteCanvas: (id: string) => Promise<void>;
}

const initialFilters: FilterState = {
  fases: [],
  procesFases: [],
  afdelingen: [],
  klantreisStatussen: [],
  zoekterm: ''
};

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  nodes: [],
  edges: [],
  modules: [],
  history: [],
  historyIndex: -1,
  selectedNode: null,
  selectedEdgeId: null,
  isDetailPanelOpen: false,
  isEditMode: false,
  isSidebarOpen: true,
  filters: initialFilters,
  user: null,
  canvasList: [],
  activeCanvasId: null,
  activeCanvasName: null,
  bronTekst: null,

  // Undo actions
  _saveToHistory: () => {
    const state = get();
    const entry: HistoryEntry = { nodes: state.nodes, edges: state.edges };
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(entry);
    if (newHistory.length > MAX_HISTORY) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex <= 0) return;
    const newIndex = state.historyIndex - 1;
    const entry = state.history[newIndex];
    set({
      nodes: entry.nodes,
      edges: entry.edges,
      historyIndex: newIndex,
      selectedNode: null,
      isDetailPanelOpen: false,
    });
  },

  canUndo: () => get().historyIndex > 0,

  // Data actions
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setModules: (modules) => set({ modules }),

  addNode: (node) => {
    get()._saveToHistory();
    set((state) => ({ nodes: [...state.nodes, node] }));
  },

  updateNode: (id, updates) => {
    get()._saveToHistory();
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...updates } : node
      ),
      selectedNode: state.selectedNode?.id === id
        ? { ...state.selectedNode, ...updates }
        : state.selectedNode
    }));
  },

  deleteNode: (id) => {
    get()._saveToHistory();
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter((edge) => edge.van !== id && edge.naar !== id),
      selectedNode: state.selectedNode?.id === id ? null : state.selectedNode,
      isDetailPanelOpen: state.selectedNode?.id === id ? false : state.isDetailPanelOpen
    }));
  },

  addEdge: (edge) => {
    get()._saveToHistory();
    set((state) => ({ edges: [...state.edges, edge] }));
  },

  updateEdge: (id, updates) => {
    get()._saveToHistory();
    set((state) => ({
      edges: state.edges.map((edge) =>
        edge.id === id ? { ...edge, ...updates } : edge
      )
    }));
  },

  deleteEdge: (id) => {
    get()._saveToHistory();
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id)
    }));
  },

  // UI actions
  setSelectedNode: (node) => set({
    selectedNode: node,
    selectedEdgeId: null,
    isDetailPanelOpen: node !== null
  }),

  setSelectedEdge: (edgeId) => set({
    selectedEdgeId: edgeId,
    selectedNode: null,
    isDetailPanelOpen: edgeId !== null
  }),

  openDetailPanel: () => set({ isDetailPanelOpen: true }),
  closeDetailPanel: () => set({ isDetailPanelOpen: false, selectedNode: null }),
  toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  // Filter actions
  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  })),

  resetFilters: () => set({ filters: initialFilters }),

  // User actions
  setUser: (user) => set({ user }),

  setBronTekst: (tekst) => set({ bronTekst: tekst }),

  // Canvas actions (async)
  loadCanvasList: async () => {
    const list = await canvasStorage.getCanvasMetadataList();
    set({ canvasList: list });
  },

  createNewCanvas: () => set({
    nodes: [],
    edges: [],
    selectedNode: null,
    isDetailPanelOpen: false,
    activeCanvasId: null,
    activeCanvasName: null,
    bronTekst: null,
    filters: initialFilters,
    history: [],
    historyIndex: -1,
  }),

  saveCanvas: async (naam, beschrijving) => {
    const state = get();
    if (state.activeCanvasId) {
      await canvasStorage.updateCanvas(state.activeCanvasId, state.nodes, state.edges, naam, beschrijving, state.bronTekst ?? undefined);
      saveLastSession({ view: 'procesflow', id: state.activeCanvasId });
    } else {
      const newCanvas = await canvasStorage.saveNewCanvas(naam, state.nodes, state.edges, beschrijving, state.bronTekst ?? undefined);
      set({ activeCanvasId: newCanvas.id });
      saveLastSession({ view: 'procesflow', id: newCanvas.id });
    }
    const list = await canvasStorage.getCanvasMetadataList();
    set({ activeCanvasName: naam, canvasList: list });
  },

  saveCanvasAs: async (naam, beschrijving) => {
    const state = get();
    const newCanvas = await canvasStorage.saveNewCanvas(naam, state.nodes, state.edges, beschrijving, state.bronTekst ?? undefined);
    const list = await canvasStorage.getCanvasMetadataList();
    set({ activeCanvasId: newCanvas.id, activeCanvasName: newCanvas.naam, canvasList: list });
    saveLastSession({ view: 'procesflow', id: newCanvas.id });
  },

  loadCanvas: async (id) => {
    const canvas = await canvasStorage.getCanvas(id);
    if (canvas) {
      set({
        nodes: canvas.nodes,
        edges: canvas.edges,
        activeCanvasId: canvas.id,
        activeCanvasName: canvas.naam,
        bronTekst: canvas.bronTekst ?? null,
        selectedNode: null,
        isDetailPanelOpen: false,
        filters: initialFilters,
        history: [],
        historyIndex: -1,
      });
      saveLastSession({ view: 'procesflow', id: canvas.id });
    }
  },

  deleteCanvas: async (id) => {
    await canvasStorage.deleteCanvas(id);
    const list = await canvasStorage.getCanvasMetadataList();
    const state = get();
    if (state.activeCanvasId === id) {
      set({
        canvasList: list,
        nodes: [],
        edges: [],
        activeCanvasId: null,
        activeCanvasName: null,
        selectedNode: null,
        isDetailPanelOpen: false,
      });
    } else {
      set({ canvasList: list });
    }
  },
}));

// Selector hooks voor performance
export const useNodes = () => useStore((state) => state.nodes);
export const useEdges = () => useStore((state) => state.edges);
export const useModules = () => useStore((state) => state.modules);
export const useSelectedNode = () => useStore((state) => state.selectedNode);
export const useFilters = () => useStore((state) => state.filters);
export const useUser = () => useStore((state) => state.user);

// Filtered nodes selector
export const useFilteredNodes = () => {
  const nodes = useStore((state) => state.nodes);
  const filters = useStore((state) => state.filters);

  return nodes.filter((node) => {
    if (filters.zoekterm) {
      const zoek = filters.zoekterm.toLowerCase();
      const matchesTitel = node.titel.toLowerCase().includes(zoek);
      const matchesBeschrijving = node.korteBeschrijving.toLowerCase().includes(zoek);
      const matchesId = node.id.toLowerCase().includes(zoek);
      if (!matchesTitel && !matchesBeschrijving && !matchesId) return false;
    }

    if (filters.fases.length > 0 && !filters.fases.includes(node.fase)) return false;
    if (filters.procesFases.length > 0 && !filters.procesFases.includes(node.procesFase)) return false;
    if (filters.afdelingen.length > 0 && !filters.afdelingen.includes(node.primaireAfdeling)) return false;
    if (filters.klantreisStatussen.length > 0 && !filters.klantreisStatussen.includes(node.klantreisStatus)) return false;

    return true;
  });
};
