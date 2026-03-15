import { useEffect, useState, Component, type ReactNode } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { useStore } from './store/useStore';
import { readLastSession } from './store/useStore';
import { useDecisionFlowchartStore } from './store/useDecisionFlowchartStore';
import { useFilterConfigStore } from './store/useFilterConfigStore';
import { loadAllData } from './lib/dataLoader';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import DetailPanel from './components/layout/DetailPanel';
import DecisionDetailPanel from './components/layout/DecisionDetailPanel';
import FlowCanvas from './components/flow/FlowCanvas';
import { DecisionFlowCanvas } from './components/decision';
import { NodeDialog, EdgeDialog, EdgeEditDialog, DecisionNodeDialog, DecisionEdgeDialog, SaveDecisionFlowchartDialog, DecisionFlowchartArchiveDialog } from './components/dialogs';
import { SaveCanvasDialog } from './components/dialogs/SaveCanvasDialog';
import { CanvasArchiveDialog } from './components/dialogs/CanvasArchiveDialog';
import { ImportDocumentDialog } from './components/dialogs/ImportDocumentDialog';
import { AdminDashboard } from './components/admin';
import type { ParseResult } from './lib/documentParser';
import type { DecisionNodeType } from './types/decisionFlowchart';

type ActiveView = 'procesflow' | 'decision';

// Error Boundary component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex items-center justify-center bg-gray-950">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-400 mb-4">Er is iets misgegaan</h1>
            <pre className="text-sm text-red-300 bg-red-950/50 border border-red-800 p-4 rounded max-w-xl overflow-auto">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Pagina herladen
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, _setLoadError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>(() => {
    const last = readLastSession();
    return last?.view ?? 'procesflow';
  });

  const handleViewChange = (view: ActiveView) => {
    setActiveView(view);
    // Bewaar view-keuze in de bestaande sessie
    const last = readLastSession();
    if (last) {
      try { localStorage.setItem('procesflow_last_session', JSON.stringify({ ...last, view })); } catch { /* ignore */ }
    }
  };

  // ProcesFlow state
  const [isNodeDialogOpen, setIsNodeDialogOpen] = useState(false);
  const [isEdgeDialogOpen, setIsEdgeDialogOpen] = useState(false);
  const [edgeSourceNodeId, setEdgeSourceNodeId] = useState<string | null>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isNewCanvasConfirmOpen, setIsNewCanvasConfirmOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isImportDocumentOpen, setIsImportDocumentOpen] = useState(false);

  // Decision Flowchart state
  const [isDecisionNodeDialogOpen, setIsDecisionNodeDialogOpen] = useState(false);
  const [decisionNodeType, setDecisionNodeType] = useState<DecisionNodeType | undefined>();
  const [isDecisionEdgeDialogOpen, setIsDecisionEdgeDialogOpen] = useState(false);
  const [isDecisionSaveDialogOpen, setIsDecisionSaveDialogOpen] = useState(false);
  const [isDecisionArchiveDialogOpen, setIsDecisionArchiveDialogOpen] = useState(false);
  const [isNewDecisionFlowchartConfirmOpen, setIsNewDecisionFlowchartConfirmOpen] = useState(false);

  // ProcesFlow store
  const setNodes = useStore((state) => state.setNodes);
  const setEdges = useStore((state) => state.setEdges);
  const setModules = useStore((state) => state.setModules);
  const setUser = useStore((state) => state.setUser);
  const setBronTekst = useStore((state) => state.setBronTekst);
  const nodes = useStore((state) => state.nodes);
  const loadCanvasList = useStore((state) => state.loadCanvasList);
  const loadCanvas = useStore((state) => state.loadCanvas);
  const createNewCanvas = useStore((state) => state.createNewCanvas);
  const undo = useStore((state) => state.undo);
  const canUndo = useStore((state) => state.canUndo);

  // Decision Flowchart store
  const decisionNodes = useDecisionFlowchartStore((state) => state.nodes);
  const loadDecisionFlowchartList = useDecisionFlowchartStore((state) => state.loadFlowchartList);
  const loadFlowchart = useDecisionFlowchartStore((state) => state.loadFlowchart);
  const createNewDecisionFlowchart = useDecisionFlowchartStore((state) => state.createNewFlowchart);

  // Filter Config store
  const loadFilterConfig = useFilterConfigStore((state) => state.loadConfig);

  const handleAddNode = () => {
    setIsNodeDialogOpen(true);
  };

  const handleAddEdge = (sourceNodeId?: string) => {
    setEdgeSourceNodeId(sourceNodeId || null);
    setIsEdgeDialogOpen(true);
  };

  const handleImportDocument = (result: ParseResult, documentText: string) => {
    setNodes(result.nodes);
    setEdges(result.edges);
    setBronTekst(documentText);
  };

  const handleNewCanvas = () => {
    // Als er nodes zijn, vraag bevestiging
    if (nodes.length > 0) {
      setIsNewCanvasConfirmOpen(true);
    } else {
      createNewCanvas();
    }
  };

  const handleConfirmNewCanvas = () => {
    createNewCanvas();
    setIsNewCanvasConfirmOpen(false);
  };

  // Decision Flowchart handlers
  const handleAddDecisionNode = (type?: DecisionNodeType) => {
    setDecisionNodeType(type);
    setIsDecisionNodeDialogOpen(true);
  };

  const handleAddDecisionEdge = () => {
    setIsDecisionEdgeDialogOpen(true);
  };

  const handleNewDecisionFlowchart = () => {
    if (decisionNodes.length > 0) {
      setIsNewDecisionFlowchartConfirmOpen(true);
    } else {
      createNewDecisionFlowchart();
    }
  };

  const handleConfirmNewDecisionFlowchart = () => {
    createNewDecisionFlowchart();
    setIsNewDecisionFlowchartConfirmOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
        if (activeView === 'procesflow' && canUndo()) {
          e.preventDefault();
          undo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeView, undo, canUndo]);

  useEffect(() => {
    const init = async () => {
      try {
        setModules(loadAllData().modules);

        setUser({
          id: 'demo-user',
          email: 'demo@vastgoednederland.nl',
          naam: 'Demo Gebruiker',
          rol: 'admin',
        });

        // Laad lijsten parallel
        await Promise.all([
          loadCanvasList(),
          loadDecisionFlowchartList(),
          loadFilterConfig(),
        ]);

        // Herstel laatste sessie
        const lastSession = readLastSession();
        if (lastSession?.id) {
          if (lastSession.view === 'procesflow') {
            await loadCanvas(lastSession.id);
          } else if (lastSession.view === 'decision') {
            await loadFlowchart(lastSession.id);
          }
        } else {
          // Geen opgeslagen sessie: laad standaard JSON data
          const data = loadAllData();
          setNodes(data.nodes);
          setEdges(data.edges);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load data:', err);
        // Fallback: laad standaard data
        const data = loadAllData();
        setNodes(data.nodes);
        setEdges(data.edges);
        setIsLoading(false);
      }
    };

    init();
  }, [setNodes, setEdges, setModules, setUser, loadCanvasList, loadDecisionFlowchartList, loadFilterConfig, loadCanvas, loadFlowchart]);

  if (loadError) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Fout bij laden data</h1>
          <pre className="text-sm text-red-300 bg-red-950/50 border border-red-800 p-4 rounded">{loadError}</pre>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Procesmodel laden...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col overflow-hidden bg-gray-950">
        <Header
          activeView={activeView}
          onViewChange={handleViewChange}
          // ProcesFlow handlers
          onAddNode={handleAddNode}
          onAddEdge={() => handleAddEdge()}
          onSaveCanvas={() => setIsSaveDialogOpen(true)}
          onOpenArchive={() => setIsArchiveDialogOpen(true)}
          onNewCanvas={handleNewCanvas}
          onImportDocument={() => setIsImportDocumentOpen(true)}
          onOpenAdmin={() => setIsAdminDashboardOpen(true)}
          // Decision Flowchart handlers
          onAddDecisionNode={handleAddDecisionNode}
          onAddDecisionEdge={handleAddDecisionEdge}
          onSaveDecisionFlowchart={() => setIsDecisionSaveDialogOpen(true)}
          onOpenDecisionArchive={() => setIsDecisionArchiveDialogOpen(true)}
          onNewDecisionFlowchart={handleNewDecisionFlowchart}
        />
        <div className="flex-1 flex overflow-hidden">
          {activeView === 'procesflow' ? (
            <>
              <Sidebar />
              <main className="flex-1 overflow-hidden">
                <ReactFlowProvider>
                  <FlowCanvas />
                </ReactFlowProvider>
              </main>
              <DetailPanel onAddEdge={handleAddEdge} />
            </>
          ) : (
            <>
              <main className="flex-1 overflow-hidden">
                <ReactFlowProvider>
                  <DecisionFlowCanvas />
                </ReactFlowProvider>
              </main>
              <DecisionDetailPanel onAddEdge={handleAddDecisionEdge} />
            </>
          )}
        </div>
      </div>

      {/* ProcesFlow Dialogs */}
      <NodeDialog
        isOpen={isNodeDialogOpen}
        onClose={() => setIsNodeDialogOpen(false)}
      />
      <EdgeDialog
        isOpen={isEdgeDialogOpen}
        onClose={() => {
          setIsEdgeDialogOpen(false);
          setEdgeSourceNodeId(null);
        }}
        sourceNodeId={edgeSourceNodeId}
      />
      <SaveCanvasDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
      />
      <CanvasArchiveDialog
        isOpen={isArchiveDialogOpen}
        onClose={() => setIsArchiveDialogOpen(false)}
      />
      <EdgeEditDialog />

      {/* Decision Flowchart Dialogs */}
      <DecisionNodeDialog
        isOpen={isDecisionNodeDialogOpen}
        onClose={() => {
          setIsDecisionNodeDialogOpen(false);
          setDecisionNodeType(undefined);
        }}
        defaultType={decisionNodeType}
      />
      <DecisionEdgeDialog
        isOpen={isDecisionEdgeDialogOpen}
        onClose={() => setIsDecisionEdgeDialogOpen(false)}
      />
      <SaveDecisionFlowchartDialog
        isOpen={isDecisionSaveDialogOpen}
        onClose={() => setIsDecisionSaveDialogOpen(false)}
      />
      <DecisionFlowchartArchiveDialog
        isOpen={isDecisionArchiveDialogOpen}
        onClose={() => setIsDecisionArchiveDialogOpen(false)}
      />

      {/* Import Document Dialog */}
      <ImportDocumentDialog
        isOpen={isImportDocumentOpen}
        onClose={() => setIsImportDocumentOpen(false)}
        onImport={handleImportDocument}
      />

      {/* Admin Dashboard */}
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
      />

      {/* Confirm dialogs */}
      {isNewCanvasConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setIsNewCanvasConfirmOpen(false)} />
          <div className="relative bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Nieuw canvas aanmaken?</h3>
            <p className="text-gray-400 mb-4">
              Je hebt niet-opgeslagen wijzigingen. Wil je een nieuw leeg canvas starten?
              Zorg dat je eerst opslaat als je de huidige data wilt behouden.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsNewCanvasConfirmOpen(false)}
                className="px-4 py-2 text-gray-400 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={handleConfirmNewCanvas}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Nieuw canvas
              </button>
            </div>
          </div>
        </div>
      )}
      {isNewDecisionFlowchartConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setIsNewDecisionFlowchartConfirmOpen(false)} />
          <div className="relative bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Nieuw flowchart aanmaken?</h3>
            <p className="text-gray-400 mb-4">
              Je hebt niet-opgeslagen wijzigingen. Wil je een nieuw leeg flowchart starten?
              Zorg dat je eerst opslaat als je de huidige data wilt behouden.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsNewDecisionFlowchartConfirmOpen(false)}
                className="px-4 py-2 text-gray-400 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Annuleren
              </button>
              <button
                onClick={handleConfirmNewDecisionFlowchart}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Nieuw flowchart
              </button>
            </div>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
}

export default App;
