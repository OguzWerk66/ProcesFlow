import { useCallback, useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnectStart,
  applyNodeChanges,
  applyEdgeChanges,
  Panel,
  useReactFlow,
} from '@xyflow/react';
import { Undo } from 'lucide-react';
import '@xyflow/react/dist/style.css';

import {
  StartNode,
  EndNode,
  DecisionNodeComponent,
  ActionNode,
  SubprocessNode,
} from './nodes';
import { DecisionEdge } from './edges';
import HandleContextMenu from './HandleContextMenu';
import EdgeContextMenu from './EdgeContextMenu';
import { useDecisionFlowchartStore } from '../../store/useDecisionFlowchartStore';
import { useAfdelingKleuren } from '../../store/useFilterConfigStore';
import type { DecisionNode as DecisionNodeType, DecisionEdge as DecisionEdgeType, DecisionNodeType as NodeType } from '../../types/decisionFlowchart';

const nodeTypes = {
  start: StartNode,
  end: EndNode,
  decision: DecisionNodeComponent,
  action: ActionNode,
  subprocess: SubprocessNode,
} as const;

const edgeTypes = {
  decisionEdge: DecisionEdge,
} as const;

// Helper functie om default positie te berekenen voor nodes zonder opgeslagen positie
function calculateDefaultPosition(_node: DecisionNodeType, index: number): { x: number; y: number } {
  const X_SPACING = 250;
  const Y_SPACING = 150;
  const START_X = 100;
  const START_Y = 100;

  // Basis positie gebaseerd op index
  const col = index % 4;
  const row = Math.floor(index / 4);

  return {
    x: START_X + col * X_SPACING,
    y: START_Y + row * Y_SPACING,
  };
}

// Converteer store nodes naar ReactFlow nodes
function convertNodes(
  nodes: DecisionNodeType[],
  onShowConnectionMenu?: (nodeId: string, handleType: 'source' | 'ja' | 'nee') => void
): Node[] {
  return nodes.map((node, index) => {
    const position = node.position || calculateDefaultPosition(node, index);

    return {
      id: node.id,
      type: node.type,
      position,
      data: {
        decisionNode: node,
        onShowConnectionMenu
      },
      draggable: true,
    };
  });
}

// Converteer store edges naar ReactFlow edges
function convertEdges(edges: DecisionEdgeType[]): Edge[] {
  return edges.map((edge) => ({
    id: edge.id,
    source: edge.van,
    target: edge.naar,
    type: 'decisionEdge',
    data: {
      label: edge.label || (edge.type === 'ja' ? 'Ja' : edge.type === 'nee' ? 'Nee' : ''),
      edgeType: edge.type,
    },
    // Specifieke handles voor decision nodes
    sourceHandle: edge.type === 'ja' ? 'ja' : edge.type === 'nee' ? 'nee' : 'source',
    targetHandle: 'target',
  }));
}

// Helper functie om te checken of een element een handle is
function isHandleElement(element: EventTarget | null): boolean {
  if (!element || !(element instanceof HTMLElement)) return false;

  // Check of het element of een parent de 'react-flow__handle' class heeft
  let current: HTMLElement | null = element;
  while (current) {
    if (current.classList?.contains('react-flow__handle')) {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

// Inner component dat useReactFlow kan gebruiken
function DecisionFlowCanvasInner() {
  const storeNodes = useDecisionFlowchartStore((state) => state.nodes);
  const storeEdges = useDecisionFlowchartStore((state) => state.edges);
  const setSelectedNode = useDecisionFlowchartStore((state) => state.setSelectedNode);
  const setSelectedEdge = useDecisionFlowchartStore((state) => state.setSelectedEdge);
  const updateNode = useDecisionFlowchartStore((state) => state.updateNode);
  const addNode = useDecisionFlowchartStore((state) => state.addNode);
  const addEdge = useDecisionFlowchartStore((state) => state.addEdge);
  const deleteEdge = useDecisionFlowchartStore((state) => state.deleteEdge);
  const afdelingKleuren = useAfdelingKleuren();

  const { screenToFlowPosition } = useReactFlow();
  const undo = useDecisionFlowchartStore((state) => state.undo);
  const canUndo = useDecisionFlowchartStore((state) => state.canUndo);

  const [nodes, setNodes] = useState<Node[]>(() => convertNodes(storeNodes, undefined));
  const [edges, setEdges] = useState<Edge[]>(() => convertEdges(storeEdges));

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    sourceNodeId: string;
    sourceNodeType: NodeType;
    handleType: 'source' | 'ja' | 'nee';
    flowPosition: { x: number; y: number };
    availableNodes: DecisionNodeType[];
  } | null>(null);

  // Edge context menu state
  const [edgeContextMenu, setEdgeContextMenu] = useState<{
    x: number;
    y: number;
    edgeId: string;
  } | null>(null);

  // Track connection start voor handle click detection
  const connectingRef = useRef<{
    nodeId: string;
    handleId: string | null;
    handleType: string;
    startTime: number;
  } | null>(null);

  // Handler voor link knop klikken op nodes
  const handleShowConnectionMenu = useCallback(
    (nodeId: string, handleType: 'source' | 'ja' | 'nee') => {
      const sourceNode = storeNodes.find(n => n.id === nodeId);
      if (!sourceNode) return;

      // Get mouse position (center of screen for now, could be improved)
      const clientX = window.innerWidth / 2;
      const clientY = window.innerHeight / 2;

      // Convert screen position to flow position voor node placement
      const flowPosition = screenToFlowPosition({ x: clientX, y: clientY });

      // Filter available nodes: exclude the source node and nodes that are already connected
      const availableNodes = storeNodes.filter(node => {
        // Exclude source node
        if (node.id === nodeId) return false;

        // Exclude nodes that are already connected from this source
        const existingEdges = storeEdges.filter(edge => edge.van === nodeId);
        if (existingEdges.some(edge => edge.naar === node.id)) return false;

        // For decision nodes, prefer nodes that make sense in the flow
        return true;
      });

      setContextMenu({
        x: clientX,
        y: clientY,
        sourceNodeId: nodeId,
        sourceNodeType: sourceNode.type,
        handleType,
        flowPosition,
        availableNodes,
      });
    },
    [storeNodes, storeEdges, screenToFlowPosition]
  );

  // Update nodes when handleShowConnectionMenu becomes available
  useEffect(() => {
    if (handleShowConnectionMenu) {
      setNodes((currentNodes) => {
        const newNodes = convertNodes(storeNodes, handleShowConnectionMenu);
        // Behoud huidige posities voor nodes die verplaatst zijn maar nog niet opgeslagen
        return newNodes.map(newNode => {
          const currentNode = currentNodes.find(n => n.id === newNode.id);
          // Als de node een opgeslagen positie heeft in store, gebruik die
          const storeNode = storeNodes.find(n => n.id === newNode.id);
          if (storeNode?.position) {
            return newNode;
          }
          // Anders behoud de huidige positie als die er is
          if (currentNode) {
            return { ...newNode, position: currentNode.position };
          }
          return newNode;
        });
      });
    }
  }, [handleShowConnectionMenu]);

  // Sync met store - altijd bijwerken bij wijzigingen in storeNodes of storeEdges
  useEffect(() => {
    setNodes((currentNodes) => {
      const newNodes = convertNodes(storeNodes, handleShowConnectionMenu);
      // Behoud huidige posities voor nodes die verplaatst zijn maar nog niet opgeslagen
      return newNodes.map(newNode => {
        const currentNode = currentNodes.find(n => n.id === newNode.id);
        // Als de node een opgeslagen positie heeft in store, gebruik die
        const storeNode = storeNodes.find(n => n.id === newNode.id);
        if (storeNode?.position) {
          return newNode;
        }
        // Anders behoud de huidige positie als die er is
        if (currentNode) {
          return { ...newNode, position: currentNode.position };
        }
        return newNode;
      });
    });
  }, [storeNodes, handleShowConnectionMenu]);

  useEffect(() => {
    setEdges(convertEdges(storeEdges));
  }, [storeEdges]);

  // Handlers voor node/edge changes (drag, select, etc.)
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  // Handler voor wanneer een node wordt verplaatst - sla positie op in store
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      updateNode(node.id, { position: { x: node.position.x, y: node.position.y } });
    },
    [updateNode]
  );

  // Reset layout knop - verwijdert alle opgeslagen posities
  const resetLayout = useCallback(() => {
    storeNodes.forEach(node => {
      updateNode(node.id, { position: undefined });
    });
    setNodes(convertNodes(storeNodes.map(n => ({ ...n, position: undefined })), handleShowConnectionMenu));
  }, [storeNodes, updateNode, handleShowConnectionMenu]);

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // Check of de klik op een handle was - zo ja, niet het detail panel openen
      if (isHandleElement(event.target)) {
        return;
      }

      const decisionNode = storeNodes.find((n) => n.id === node.id);
      if (decisionNode) {
        setSelectedNode(decisionNode);
      }
    },
    [storeNodes, setSelectedNode]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    setContextMenu(null);
    setEdgeContextMenu(null);
  }, [setSelectedNode, setSelectedEdge]);

  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.stopPropagation();
      setSelectedEdge(edge.id);
      setSelectedNode(null);
      setContextMenu(null);

      setEdgeContextMenu({
        x: event.clientX,
        y: event.clientY,
        edgeId: edge.id,
      });
    },
    [setSelectedEdge, setSelectedNode]
  );

  // Track wanneer een verbinding start (handle click)
  const onConnectStart: OnConnectStart = useCallback(
    (_event, params) => {
      if (params.nodeId && params.handleType === 'source') {
        connectingRef.current = {
          nodeId: params.nodeId,
          handleId: params.handleId,
          handleType: params.handleType,
          startTime: Date.now(),
        };
      }
    },
    []
  );

  // Wanneer de verbinding eindigt - toon context menu (zowel bij klik als sleep)
  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!connectingRef.current) return;

      const { nodeId, handleId } = connectingRef.current;
      const sourceNode = storeNodes.find(n => n.id === nodeId);

      if (!sourceNode) {
        connectingRef.current = null;
        return;
      }

      // Get mouse position
      const clientX = 'clientX' in event ? event.clientX : event.touches[0].clientX;
      const clientY = 'clientY' in event ? event.clientY : event.touches[0].clientY;

      // Convert screen position to flow position voor node placement
      const flowPosition = screenToFlowPosition({ x: clientX, y: clientY });

      // Determine handle type
      let handleType: 'source' | 'ja' | 'nee' = 'source';
      if (handleId === 'ja') handleType = 'ja';
      else if (handleId === 'nee') handleType = 'nee';

      // Filter available nodes: exclude the source node and nodes that would create cycles
      const availableNodes = storeNodes.filter(node => {
        // Exclude source node
        if (node.id === nodeId) return false;

        // Exclude nodes that are already connected from this source
        const existingEdges = storeEdges.filter(edge => edge.van === nodeId);
        if (existingEdges.some(edge => edge.naar === node.id)) return false;

        // For decision nodes, prefer nodes that make sense in the flow
        // (this is a simple filter, could be enhanced)
        return true;
      });

      setContextMenu({
        x: clientX,
        y: clientY,
        sourceNodeId: nodeId,
        sourceNodeType: sourceNode.type,
        handleType,
        flowPosition,
        availableNodes,
      });

      connectingRef.current = null;
    },
    [storeNodes, screenToFlowPosition]
  );

  // Handler voor context menu selectie - nieuwe node type
  const handleContextMenuSelectNodeType = useCallback(
    (type: NodeType) => {
      if (!contextMenu) return;

      const { sourceNodeId, handleType, flowPosition } = contextMenu;

      // Genereer nieuwe node ID
      const newNodeId = `node-${Date.now()}`;

      // Bepaal edge type
      let edgeType: 'ja' | 'nee' | 'standaard' = 'standaard';
      if (handleType === 'ja') edgeType = 'ja';
      else if (handleType === 'nee') edgeType = 'nee';

      // Maak nieuwe node
      const newNode: DecisionNodeType = {
        id: newNodeId,
        type,
        titel: type === 'start' ? 'Start' : type === 'end' ? 'Einde' : type === 'decision' ? 'Nieuwe vraag?' : type === 'subprocess' ? 'Subprocess' : 'Nieuwe actie',
        position: {
          x: flowPosition.x - 80, // Center the node
          y: flowPosition.y,
        },
      };

      // Voeg node toe
      addNode(newNode);

      // Maak edge
      const newEdge: DecisionEdgeType = {
        id: `edge-${Date.now()}`,
        van: sourceNodeId,
        naar: newNodeId,
        type: edgeType,
        label: edgeType === 'ja' ? 'Ja' : edgeType === 'nee' ? 'Nee' : undefined,
      };

      // Voeg edge toe
      addEdge(newEdge);

      // Sluit context menu
      setContextMenu(null);

      // Selecteer de nieuwe node
      setSelectedNode(newNode);
    },
    [contextMenu, addNode, addEdge, setSelectedNode]
  );

  // Handler voor context menu selectie - bestaande node
  const handleContextMenuSelectExistingNode = useCallback(
    (targetNodeId: string) => {
      if (!contextMenu) return;

      const { sourceNodeId, handleType } = contextMenu;

      // Bepaal edge type
      let edgeType: 'ja' | 'nee' | 'standaard' = 'standaard';
      if (handleType === 'ja') edgeType = 'ja';
      else if (handleType === 'nee') edgeType = 'nee';

      // Maak edge naar bestaande node
      const newEdge: DecisionEdgeType = {
        id: `edge-${Date.now()}`,
        van: sourceNodeId,
        naar: targetNodeId,
        type: edgeType,
        label: edgeType === 'ja' ? 'Ja' : edgeType === 'nee' ? 'Nee' : undefined,
      };

      // Voeg edge toe
      addEdge(newEdge);

      // Sluit context menu
      setContextMenu(null);

      // Selecteer de target node
      const targetNode = storeNodes.find(n => n.id === targetNodeId);
      if (targetNode) {
        setSelectedNode(targetNode);
      }
    },
    [contextMenu, addEdge, setSelectedNode, storeNodes]
  );

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onConnectStart={onConnectStart}
        onConnectEnd={onConnectEnd}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
        elementsSelectable={true}
      >
        <Background color="#e2e8f0" gap={20} />
        <Controls className="!shadow-md !border !border-slate-200" />
        <MiniMap
          nodeColor={(node) => {
            // Kleur gebaseerd op node type of afdeling
            const nodeType = node.type;
            if (nodeType === 'start') return '#4CAF50';
            if (nodeType === 'end') return '#f44336';
            if (nodeType === 'decision') return '#FFC107';
            if (nodeType === 'subprocess') return '#9C27B0';

            // Action nodes: gebruik afdeling kleur
            const data = node.data as { decisionNode?: DecisionNodeType } | undefined;
            const decisionNode = data?.decisionNode;
            if (decisionNode?.afdeling && afdelingKleuren[decisionNode.afdeling]) {
              return afdelingKleuren[decisionNode.afdeling];
            }
            return '#2196F3';
          }}
          maskColor="rgba(0,0,0,0.1)"
          className="!shadow-md !border !border-slate-200"
          pannable
          zoomable
        />
        <Panel position="top-left" className="bg-white/90 px-3 py-2 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600">
              <span className="font-medium">{storeNodes.length}</span> stappen
            </div>
            <button
              onClick={() => undo()}
              disabled={!canUndo()}
              className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded text-slate-600 transition-colors flex items-center gap-1"
              title="Laatste actie ongedaan maken"
            >
              <Undo size={12} />
              Undo
            </button>
            <button
              onClick={resetLayout}
              className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition-colors"
            >
              Reset layout
            </button>
          </div>
        </Panel>
        <Panel position="top-right" className="bg-white/90 px-3 py-2 rounded-lg shadow-sm border border-slate-200 text-xs text-slate-500">
          Klik op een connectiepunt om een vervolgstap toe te voegen
        </Panel>
      </ReactFlow>

      {/* Context menu voor handle click */}
      {contextMenu && (
        <HandleContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onSelectNodeType={handleContextMenuSelectNodeType}
          onSelectExistingNode={handleContextMenuSelectExistingNode}
          onClose={() => setContextMenu(null)}
          sourceNodeType={contextMenu.sourceNodeType}
          handleType={contextMenu.handleType}
          availableNodes={contextMenu.availableNodes}
        />
      )}

      {/* Context menu voor edge click */}
      {edgeContextMenu && (
        <EdgeContextMenu
          x={edgeContextMenu.x}
          y={edgeContextMenu.y}
          onDelete={() => deleteEdge(edgeContextMenu.edgeId)}
          onClose={() => setEdgeContextMenu(null)}
        />
      )}
    </div>
  );
}

// Wrapper component
export default function DecisionFlowCanvas() {
  return <DecisionFlowCanvasInner />;
}
