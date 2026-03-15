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
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from '@dagrejs/dagre';

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

const NODE_WIDTH = 240;
const NODE_HEIGHT = 140;

// Dagre auto-layout: positioneert alle opgegeven nodes op basis van de edges
function applyDagreLayout(
  nodes: ProcesNode[],
  edges: ProcesEdge[],
): Map<string, { x: number; y: number }> {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', nodesep: 50, ranksep: 100, marginx: 60, marginy: 60 });

  const nodeIds = new Set(nodes.map((n) => n.id));

  nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges
    .filter((e) => nodeIds.has(e.van) && nodeIds.has(e.naar))
    .forEach((edge) => {
      g.setEdge(edge.van, edge.naar);
    });

  dagre.layout(g);

  const positions = new Map<string, { x: number; y: number }>();
  nodes.forEach((node) => {
    const pos = g.node(node.id);
    positions.set(node.id, {
      x: pos.x - NODE_WIDTH / 2,
      y: pos.y - NODE_HEIGHT / 2,
    });
  });

  return positions;
}

// Bouw ReactFlow nodes op — gebruik opgeslagen positie als die bestaat, anders dagre
function buildFlowNodes(
  filteredNodes: ProcesNode[],
  allStoreNodes: ProcesNode[],
  storeEdges: ProcesEdge[],
): Node[] {
  const unpositioned = filteredNodes.filter((n) => !n.position);
  const dagrePositions =
    unpositioned.length > 0
      ? applyDagreLayout(filteredNodes, storeEdges) // layout álle nodes zodat dagre verbindingen meeneemt
      : new Map<string, { x: number; y: number }>();

  return filteredNodes.map((node) => ({
    id: node.id,
    type: 'procesNode',
    position: node.position ?? dagrePositions.get(node.id) ?? { x: 0, y: 0 },
    data: { procesNode: node },
    draggable: true,
  }));
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
  const { fitView } = useReactFlow();

  const [nodes, setNodes] = useState<Node[]>(() =>
    buildFlowNodes(filteredNodes, storeNodes, storeEdges)
  );
  const [edges, setEdges] = useState<Edge[]>(() => {
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    return convertEdges(storeEdges, nodeIds);
  });

  const prevFilteredNodeIds = useRef<string>(filteredNodes.map((n) => n.id).sort().join(','));
  const prevStoreEdgesRef = useRef<string>(JSON.stringify(storeEdges.map((e) => e.id).sort()));

  useEffect(() => {
    const currentFilteredIds = filteredNodes.map((n) => n.id).sort().join(',');
    const currentEdgeIds = JSON.stringify(storeEdges.map((e) => e.id).sort());
    const filterChanged = prevFilteredNodeIds.current !== currentFilteredIds;
    const edgesChanged = prevStoreEdgesRef.current !== currentEdgeIds;

    if (filterChanged || edgesChanged) {
      const prevCount = prevFilteredNodeIds.current.split(',').filter(Boolean).length;
      const newCount = filteredNodes.length;
      const bigChange = Math.abs(newCount - prevCount) > 3;

      setNodes(buildFlowNodes(filteredNodes, storeNodes, storeEdges));
      const nodeIds = new Set(filteredNodes.map((n) => n.id));
      setEdges(convertEdges(storeEdges, nodeIds));
      prevFilteredNodeIds.current = currentFilteredIds;
      prevStoreEdgesRef.current = currentEdgeIds;

      // Fit view after a significant node change (e.g. import)
      if (bigChange && newCount > 0) {
        setTimeout(() => fitView({ padding: 0.15, maxZoom: 0.8, duration: 400 }), 50);
      }
    }
  }, [filteredNodes, storeEdges, storeNodes, fitView]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      updateNode(node.id, { position: { x: node.position.x, y: node.position.y } });
    },
    [updateNode]
  );

  // Auto-layout: past dagre toe op álle zichtbare nodes en slaat posities op
  const autoLayout = useCallback(() => {
    const nodesForLayout = filteredNodes.map((n) => ({ ...n, position: undefined }));
    const positions = applyDagreLayout(nodesForLayout, storeEdges);

    // Sla nieuwe posities op in store
    filteredNodes.forEach((node) => {
      const pos = positions.get(node.id);
      if (pos) updateNode(node.id, { position: pos });
    });

    setNodes(
      filteredNodes.map((node) => ({
        id: node.id,
        type: 'procesNode',
        position: positions.get(node.id) ?? { x: 0, y: 0 },
        data: { procesNode: node },
        draggable: true,
      }))
    );

    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    setEdges(convertEdges(storeEdges, nodeIds));

    setTimeout(() => fitView({ padding: 0.15, maxZoom: 0.8, duration: 400 }), 50);
  }, [filteredNodes, storeEdges, updateNode, fitView]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const procesNode = filteredNodes.find((n) => n.id === node.id);
      if (procesNode) setSelectedNode(procesNode);
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
        fitViewOptions={{ padding: 0.15, maxZoom: 0.8 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
        elementsSelectable={true}
      >
        <Background color="#1e293b" gap={20} />
        <Controls className="!shadow-md !border !border-gray-700 !bg-gray-900" />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as ProcessNodeData | undefined;
            const procesNode = data?.procesNode;
            return procesNode
              ? AFDELING_KLEUREN[procesNode.primaireAfdeling] || '#374151'
              : '#374151';
          }}
          maskColor="rgba(0,0,0,0.4)"
          className="!shadow-md !border !border-gray-700 !bg-gray-900"
          pannable
          zoomable
        />
        <Panel position="top-left" className="bg-gray-900/90 px-3 py-2 rounded-lg shadow-sm border border-gray-700">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              <span className="font-medium text-gray-200">{filteredNodes.length}</span> processtappen
            </div>
            <button
              onClick={autoLayout}
              className="text-xs px-2 py-1 bg-blue-900/60 hover:bg-blue-800/60 border border-blue-700 rounded text-blue-300 transition-colors"
            >
              Auto-layout
            </button>
          </div>
        </Panel>
        <Panel position="top-right" className="bg-gray-900/90 px-3 py-2 rounded-lg shadow-sm border border-gray-700 text-xs text-gray-500">
          Sleep nodes om te verplaatsen
        </Panel>
      </ReactFlow>
    </div>
  );
}
