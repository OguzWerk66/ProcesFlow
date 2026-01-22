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
  applyNodeChanges,
  applyEdgeChanges,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import ProcessNode, { type ProcessNodeData } from './ProcessNode';
import ProcessEdge from './ProcessEdge';
import { useStore, useFilteredNodes } from '../../store/useStore';
import type { ProcesNode, ProcesEdge } from '../../types';
import { AFDELING_KLEUREN } from '../../types';

const nodeTypes = {
  procesNode: ProcessNode,
} as const;

const edgeTypes = {
  procesEdge: ProcessEdge,
} as const;

// Helper functie om een default positie te berekenen voor nodes zonder opgeslagen positie
function calculateDefaultPosition(node: ProcesNode, allNodes: ProcesNode[]): { x: number; y: number } {
  const PROCESFASE_ORDER = [
    'leadgeneratie',
    'intake',
    'aanvraag',
    'beoordeling',
    'activatie',
    'onboarding',
    'lopend-lidmaatschap',
    'wijzigingen',
    'beeindiging',
  ];

  const AFDELING_ORDER = [
    'sales',
    'ledenadministratie',
    'legal',
    'finance',
    'marcom',
    'deelnemingen',
    'it',
    'bestuur',
  ];

  const X_SPACING = 320;
  const Y_SPACING = 200;
  const NODE_OFFSET_X = 250;
  const NODE_OFFSET_Y = 160;

  // Groepeer nodes per procesfase en afdeling
  const nodesByFaseAndAfdeling: Record<string, Record<string, ProcesNode[]>> = {};
  allNodes.forEach((n) => {
    if (!nodesByFaseAndAfdeling[n.procesFase]) {
      nodesByFaseAndAfdeling[n.procesFase] = {};
    }
    if (!nodesByFaseAndAfdeling[n.procesFase][n.primaireAfdeling]) {
      nodesByFaseAndAfdeling[n.procesFase][n.primaireAfdeling] = [];
    }
    nodesByFaseAndAfdeling[n.procesFase][n.primaireAfdeling].push(n);
  });

  const faseIndex = PROCESFASE_ORDER.indexOf(node.procesFase);
  const afdelingIndex = AFDELING_ORDER.indexOf(node.primaireAfdeling);

  const nodesInCell = nodesByFaseAndAfdeling[node.procesFase]?.[node.primaireAfdeling] || [];
  const indexInCell = nodesInCell.indexOf(node);

  const col = indexInCell % 2;
  const row = Math.floor(indexInCell / 2);

  const x = (faseIndex >= 0 ? faseIndex : 0) * X_SPACING + col * NODE_OFFSET_X;
  const y = (afdelingIndex >= 0 ? afdelingIndex : 0) * Y_SPACING + row * NODE_OFFSET_Y;

  return { x, y };
}

// Helper functie om nodes te positioneren - gebruikt opgeslagen posities of berekent nieuwe
function calculateNodePositions(nodes: ProcesNode[], allStoreNodes: ProcesNode[]): Node[] {
  return nodes.map((node) => {
    // Gebruik opgeslagen positie als deze bestaat, anders bereken default
    const position = node.position || calculateDefaultPosition(node, allStoreNodes);

    return {
      id: node.id,
      type: 'procesNode',
      position,
      data: { procesNode: node },
      draggable: true,
    };
  });
}

function convertEdges(edges: ProcesEdge[], nodeIds: Set<string>): Edge[] {
  return edges
    .filter((edge) => nodeIds.has(edge.van) && nodeIds.has(edge.naar))
    .map((edge) => ({
      id: edge.id,
      source: edge.van,
      target: edge.naar,
      type: 'procesEdge',
      data: {
        label: edge.label,
        conditie: edge.conditie,
        type: edge.type,
      },
    }));
}

export default function FlowCanvas() {
  const storeNodes = useStore((state) => state.nodes);
  const storeEdges = useStore((state) => state.edges);
  const setSelectedNode = useStore((state) => state.setSelectedNode);
  const updateNode = useStore((state) => state.updateNode);
  const filteredNodes = useFilteredNodes();

  // Gebruik useState voor nodes zodat ze verplaatst kunnen worden
  const [nodes, setNodes] = useState<Node[]>(() => calculateNodePositions(filteredNodes, storeNodes));
  const [edges, setEdges] = useState<Edge[]>(() => {
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    return convertEdges(storeEdges, nodeIds);
  });

  // Track previous state to detect changes
  const prevFilteredNodeIds = useRef<string>(filteredNodes.map(n => n.id).sort().join(','));
  const prevStoreEdgesRef = useRef<string>(JSON.stringify(storeEdges.map(e => e.id).sort()));

  // Sync with store when filtered nodes or edges change
  useEffect(() => {
    const currentFilteredIds = filteredNodes.map(n => n.id).sort().join(',');
    const currentEdgeIds = JSON.stringify(storeEdges.map(e => e.id).sort());
    const filterChanged = prevFilteredNodeIds.current !== currentFilteredIds;
    const edgesChanged = prevStoreEdgesRef.current !== currentEdgeIds;

    if (filterChanged || edgesChanged) {
      // Recalculate nodes - positions komen uit store (node.position)
      setNodes(calculateNodePositions(filteredNodes, storeNodes));

      const nodeIds = new Set(filteredNodes.map((n) => n.id));
      setEdges(convertEdges(storeEdges, nodeIds));

      prevFilteredNodeIds.current = currentFilteredIds;
      prevStoreEdgesRef.current = currentEdgeIds;
    }
  }, [filteredNodes, storeEdges, storeNodes]);

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
      // Update de positie in de store zodat deze behouden blijft
      updateNode(node.id, { position: { x: node.position.x, y: node.position.y } });
    },
    [updateNode]
  );

  // Reset layout knop - verwijdert alle opgeslagen posities
  const resetLayout = useCallback(() => {
    // Reset posities in store naar undefined zodat ze opnieuw berekend worden
    filteredNodes.forEach(node => {
      updateNode(node.id, { position: undefined });
    });
    // Herbereken posities
    setNodes(calculateNodePositions(
      filteredNodes.map(n => ({ ...n, position: undefined })),
      storeNodes.map(n => ({ ...n, position: undefined }))
    ));
    const ids = new Set(filteredNodes.map((n) => n.id));
    setEdges(convertEdges(storeEdges, ids));
  }, [filteredNodes, storeNodes, storeEdges, updateNode]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const procesNode = filteredNodes.find((n) => n.id === node.id);
      if (procesNode) {
        setSelectedNode(procesNode);
      }
    },
    [filteredNodes, setSelectedNode]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.4 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
        elementsSelectable={true}
      >
        <Background color="#e2e8f0" gap={20} />
        <Controls className="!shadow-md !border !border-slate-200" />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as ProcessNodeData | undefined;
            const procesNode = data?.procesNode;
            return procesNode
              ? AFDELING_KLEUREN[procesNode.primaireAfdeling] || '#f3f4f6'
              : '#f3f4f6';
          }}
          maskColor="rgba(0,0,0,0.1)"
          className="!shadow-md !border !border-slate-200"
          pannable
          zoomable
        />
        <Panel position="top-left" className="bg-white/90 px-3 py-2 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600">
              <span className="font-medium">{filteredNodes.length}</span> processtappen
            </div>
            <button
              onClick={resetLayout}
              className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition-colors"
            >
              Reset layout
            </button>
          </div>
        </Panel>
        <Panel position="top-right" className="bg-white/90 px-3 py-2 rounded-lg shadow-sm border border-slate-200 text-xs text-slate-500">
          Sleep nodes om te verplaatsen
        </Panel>
      </ReactFlow>
    </div>
  );
}
