import { useEffect, useState, Component, type ReactNode } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { useStore } from './store/useStore';
import { useDecisionFlowchartStore } from './store/useDecisionFlowchartStore';
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
import { AdminDashboard } from './components/admin';
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
        <div className="h-screen flex items-center justify-center bg-red-50">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Er is iets misgegaan</h1>
            <pre className="text-sm text-red-800 bg-red-100 p-4 rounded max-w-xl overflow-auto">
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('procesflow');

  // ProcesFlow state
  const [isNodeDialogOpen, setIsNodeDialogOpen] = useState(false);
  const [isEdgeDialogOpen, setIsEdgeDialogOpen] = useState(false);
  const [edgeSourceNodeId, setEdgeSourceNodeId] = useState<string | null>(null);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isNewCanvasConfirmOpen, setIsNewCanvasConfirmOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

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
  const nodes = useStore((state) => state.nodes);
  const loadCanvasList = useStore((state) => state.loadCanvasList);
  const createNewCanvas = useStore((state) => state.createNewCanvas);

  // Decision Flowchart store
  const decisionNodes = useDecisionFlowchartStore((state) => state.nodes);
  const loadDecisionFlowchartList = useDecisionFlowchartStore((state) => state.loadFlowchartList);
  const createNewDecisionFlowchart = useDecisionFlowchartStore((state) => state.createNewFlowchart);

  const handleAddNode = () => {
    setIsNodeDialogOpen(true);
  };

  const handleAddEdge = (sourceNodeId?: string) => {
    setEdgeSourceNodeId(sourceNodeId || null);
    setIsEdgeDialogOpen(true);
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
    try {
      // Laad de data bij startup
      const data = loadAllData();
      console.log('Data loaded:', {
        nodes: data.nodes.length,
        edges: data.edges.length,
        modules: data.modules.length
      });

      setNodes(data.nodes);
      setEdges(data.edges);
      setModules(data.modules);

      // Set een demo user (later vervangen door echte auth)
      setUser({
        id: 'demo-user',
        email: 'demo@vastgoednederland.nl',
        naam: 'Demo Gebruiker',
        rol: 'admin',
      });

      // Laad canvas lijst
      loadCanvasList();

      // Laad decision flowchart lijst
      loadDecisionFlowchartList();

      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load data:', err);
      setLoadError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoading(false);
    }
  }, [setNodes, setEdges, setModules, setUser, loadCanvasList, loadDecisionFlowchartList]);

  if (loadError) {
    return (
      <div className="h-screen flex items-center justify-center bg-red-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Fout bij laden data</h1>
          <pre className="text-sm text-red-800 bg-red-100 p-4 rounded">{loadError}</pre>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Procesmodel laden...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col overflow-hidden">
        <Header
          activeView={activeView}
          onViewChange={setActiveView}
          // ProcesFlow handlers
          onAddNode={handleAddNode}
          onAddEdge={() => handleAddEdge()}
          onSaveCanvas={() => setIsSaveDialogOpen(true)}
          onOpenArchive={() => setIsArchiveDialogOpen(true)}
          onNewCanvas={handleNewCanvas}
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

      {/* Admin Dashboard */}
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
      />

      {/* Confirm dialogs */}
      {isNewCanvasConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsNewCanvasConfirmOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nieuw canvas aanmaken?</h3>
            <p className="text-gray-600 mb-4">
              Je hebt niet-opgeslagen wijzigingen. Wil je een nieuw leeg canvas starten?
              Zorg dat je eerst opslaat als je de huidige data wilt behouden.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsNewCanvasConfirmOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsNewDecisionFlowchartConfirmOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nieuw flowchart aanmaken?</h3>
            <p className="text-gray-600 mb-4">
              Je hebt niet-opgeslagen wijzigingen. Wil je een nieuw leeg flowchart starten?
              Zorg dat je eerst opslaat als je de huidige data wilt behouden.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsNewDecisionFlowchartConfirmOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
