import { create } from 'zustand';
import type { ProcesNode, ProcesEdge, Module, FilterState, User, CanvasMetadata } from '../types';
import * as canvasStorage from '../lib/canvasStorage';

interface AppState {
  // Data
  nodes: ProcesNode[];
  edges: ProcesEdge[];
  modules: Module[];

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

  // Actions - Data
  setNodes: (nodes: ProcesNode[]) => void;
  setEdges: (edges: ProcesEdge[]) => void;
  setModules: (modules: Module[]) => void;
  addNode: (node: ProcesNode) => void;
  updateNode: (id: string, updates: Partial<ProcesNode>) => void;
  deleteNode: (id: string) => void;
  addEdge: (edge: ProcesEdge) => void;
  updateEdge: (id: string, updates: Partial<ProcesEdge>) => void;
  deleteEdge: (id: string) => void;

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

  // Actions - Canvas
  loadCanvasList: () => void;
  createNewCanvas: () => void;
  saveCanvas: (naam: string, beschrijving?: string) => void;
  saveCanvasAs: (naam: string, beschrijving?: string) => void;
  loadCanvas: (id: string) => void;
  deleteCanvas: (id: string) => void;
}

const initialFilters: FilterState = {
  fases: [],
  procesFases: [],
  afdelingen: [],
  klantreisStatussen: [],
  zoekterm: ''
};

export const useStore = create<AppState>((set) => ({
  // Initial state
  nodes: [],
  edges: [],
  modules: [],
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

  // Data actions
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setModules: (modules) => set({ modules }),

  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, node]
  })),

  updateNode: (id, updates) => set((state) => ({
    nodes: state.nodes.map((node) =>
      node.id === id ? { ...node, ...updates } : node
    ),
    selectedNode: state.selectedNode?.id === id
      ? { ...state.selectedNode, ...updates }
      : state.selectedNode
  })),

  deleteNode: (id) => set((state) => ({
    nodes: state.nodes.filter((node) => node.id !== id),
    edges: state.edges.filter((edge) => edge.van !== id && edge.naar !== id),
    selectedNode: state.selectedNode?.id === id ? null : state.selectedNode,
    isDetailPanelOpen: state.selectedNode?.id === id ? false : state.isDetailPanelOpen
  })),

  addEdge: (edge) => set((state) => ({
    edges: [...state.edges, edge]
  })),

  updateEdge: (id, updates) => set((state) => ({
    edges: state.edges.map((edge) =>
      edge.id === id ? { ...edge, ...updates } : edge
    )
  })),

  deleteEdge: (id) => set((state) => ({
    edges: state.edges.filter((edge) => edge.id !== id)
  })),

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

  // Canvas actions
  loadCanvasList: () => {
    const list = canvasStorage.getCanvasMetadataList();
    set({ canvasList: list });
  },

  createNewCanvas: () => set({
    nodes: [],
    edges: [],
    selectedNode: null,
    isDetailPanelOpen: false,
    activeCanvasId: null,
    activeCanvasName: null,
    filters: initialFilters,
  }),

  saveCanvas: (naam, beschrijving) => set((state) => {
    if (state.activeCanvasId) {
      // Update bestaand canvas
      canvasStorage.updateCanvas(
        state.activeCanvasId,
        state.nodes,
        state.edges,
        naam,
        beschrijving
      );
    } else {
      // Nieuw canvas opslaan
      const newCanvas = canvasStorage.saveNewCanvas(
        naam,
        state.nodes,
        state.edges,
        beschrijving
      );
      return {
        activeCanvasId: newCanvas.id,
        activeCanvasName: newCanvas.naam,
        canvasList: canvasStorage.getCanvasMetadataList(),
      };
    }
    return {
      activeCanvasName: naam,
      canvasList: canvasStorage.getCanvasMetadataList(),
    };
  }),

  saveCanvasAs: (naam, beschrijving) => set((state) => {
    const newCanvas = canvasStorage.saveNewCanvas(
      naam,
      state.nodes,
      state.edges,
      beschrijving
    );
    return {
      activeCanvasId: newCanvas.id,
      activeCanvasName: newCanvas.naam,
      canvasList: canvasStorage.getCanvasMetadataList(),
    };
  }),

  loadCanvas: (id) => {
    const canvas = canvasStorage.getCanvas(id);
    if (canvas) {
      set({
        nodes: canvas.nodes,
        edges: canvas.edges,
        activeCanvasId: canvas.id,
        activeCanvasName: canvas.naam,
        selectedNode: null,
        isDetailPanelOpen: false,
        filters: initialFilters,
      });
    }
  },

  deleteCanvas: (id) => set((state) => {
    canvasStorage.deleteCanvas(id);
    const newList = canvasStorage.getCanvasMetadataList();

    // Als het actieve canvas verwijderd wordt, reset naar leeg
    if (state.activeCanvasId === id) {
      return {
        canvasList: newList,
        nodes: [],
        edges: [],
        activeCanvasId: null,
        activeCanvasName: null,
        selectedNode: null,
        isDetailPanelOpen: false,
      };
    }

    return { canvasList: newList };
  }),
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
    // Zoekterm
    if (filters.zoekterm) {
      const zoek = filters.zoekterm.toLowerCase();
      const matchesTitel = node.titel.toLowerCase().includes(zoek);
      const matchesBeschrijving = node.korteBeschrijving.toLowerCase().includes(zoek);
      const matchesId = node.id.toLowerCase().includes(zoek);
      if (!matchesTitel && !matchesBeschrijving && !matchesId) return false;
    }

    // Fase filter
    if (filters.fases.length > 0 && !filters.fases.includes(node.fase)) {
      return false;
    }

    // Procesfase filter
    if (filters.procesFases.length > 0 && !filters.procesFases.includes(node.procesFase)) {
      return false;
    }

    // Afdeling filter
    if (filters.afdelingen.length > 0 && !filters.afdelingen.includes(node.primaireAfdeling)) {
      return false;
    }

    // Klantreis filter
    if (filters.klantreisStatussen.length > 0 && !filters.klantreisStatussen.includes(node.klantreisStatus)) {
      return false;
    }

    return true;
  });
};
