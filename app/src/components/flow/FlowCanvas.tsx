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
import { ChevronLeft, ChevronRight, X, MonitorPlay, Play } from 'lucide-react';

import ProcessNode, { type ProcessNodeData } from './ProcessNode';
import ProcessEdge from './ProcessEdge';
import { useStore, useFilteredNodes } from '../../store/useStore';
import type { ProcesNode, ProcesEdge } from '../../types';
import { AFDELING_KLEUREN, AFDELING_LABELS, FASE_KLEUREN, KLANTREIS_LABELS } from '../../types';

const nodeTypes = { procesNode: ProcessNode } as const;
const edgeTypes = { procesEdge: ProcessEdge } as const;

const NODE_WIDTH = 240;
const NODE_HEIGHT = 140;

function applyDagreLayout(nodes: ProcesNode[], edges: ProcesEdge[]): Map<string, { x: number; y: number }> {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'LR', nodesep: 50, ranksep: 100, marginx: 60, marginy: 60 });
  const nodeIds = new Set(nodes.map((n) => n.id));
  nodes.forEach((node) => g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT }));
  edges.filter((e) => nodeIds.has(e.van) && nodeIds.has(e.naar)).forEach((e) => g.setEdge(e.van, e.naar));
  dagre.layout(g);
  const positions = new Map<string, { x: number; y: number }>();
  nodes.forEach((node) => {
    const pos = g.node(node.id);
    positions.set(node.id, { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 });
  });
  return positions;
}

function buildFlowNodes(filteredNodes: ProcesNode[], _allStoreNodes: ProcesNode[], storeEdges: ProcesEdge[], activeId?: string | null): Node[] {
  const unpositioned = filteredNodes.filter((n) => !n.position);
  const dagrePositions = unpositioned.length > 0
    ? applyDagreLayout(filteredNodes, storeEdges)
    : new Map<string, { x: number; y: number }>();
  return filteredNodes.map((node) => ({
    id: node.id,
    type: 'procesNode',
    position: node.position ?? dagrePositions.get(node.id) ?? { x: 0, y: 0 },
    data: {
      procesNode: node,
      // undefined = normale modus (geen presentatie), null = presentatie maar niet actief, string = actief
      presentationActive: activeId === undefined ? undefined : activeId === node.id,
    },
    draggable: true,
    zIndex: activeId === node.id ? 100 : 0,
  }));
}

function convertEdges(edges: ProcesEdge[], nodeIds: Set<string>): Edge[] {
  return edges
    .filter((e) => nodeIds.has(e.van) && nodeIds.has(e.naar))
    .map((e) => ({
      id: e.id,
      source: e.van,
      target: e.naar,
      type: 'procesEdge',
      data: { label: e.label, conditie: e.conditie, type: e.type },
    }));
}

// Topologische sortering op basis van edges
function sortNodesByFlow(nodes: ProcesNode[], edges: ProcesEdge[]): ProcesNode[] {
  const nodeIds = new Set(nodes.map((n) => n.id));
  const inDegree = new Map<string, number>();
  nodes.forEach((n) => inDegree.set(n.id, 0));
  edges.filter((e) => nodeIds.has(e.van) && nodeIds.has(e.naar))
    .forEach((e) => inDegree.set(e.naar, (inDegree.get(e.naar) || 0) + 1));
  const queue = nodes.filter((n) => (inDegree.get(n.id) || 0) === 0);
  const result: ProcesNode[] = [];
  const visited = new Set<string>();
  while (queue.length > 0) {
    const node = queue.shift()!;
    if (visited.has(node.id)) continue;
    visited.add(node.id);
    result.push(node);
    edges.filter((e) => e.van === node.id && nodeIds.has(e.naar))
      .forEach((e) => { const next = nodes.find((n) => n.id === e.naar); if (next && !visited.has(next.id)) queue.push(next); });
  }
  nodes.forEach((n) => { if (!visited.has(n.id)) result.push(n); });
  return result;
}

// Info-kaart voor actieve presentatienode
function PresentationCard({ node, index, total }: { node: ProcesNode; index: number; total: number }) {
  const borderColor = FASE_KLEUREN[node.fase] || '#3b82f6';
  const afdelingColor = AFDELING_KLEUREN[node.primaireAfdeling] || '#3b82f6';
  return (
    <div
      className="bg-gray-950/95 backdrop-blur-sm rounded-xl border-2 shadow-2xl w-80 p-4 pointer-events-none"
      style={{ borderColor, boxShadow: `0 0 24px ${borderColor}44` }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: borderColor + '33', color: borderColor }}>
          {node.fase.charAt(0).toUpperCase() + node.fase.slice(1)}
        </span>
        <span className="text-xs text-gray-500 font-mono">{index + 1} / {total}</span>
      </div>
      <h2 className="text-base font-bold text-white leading-tight mb-1.5">{node.titel}</h2>
      <p className="text-sm text-gray-300 leading-relaxed mb-3">
        {node.uitgebreideBeschrijving || node.korteBeschrijving}
      </p>
      {node.acties && node.acties.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Acties</p>
          <ul className="space-y-0.5">
            {node.acties.slice(0, 4).map((actie, i) => (
              <li key={i} className="text-xs text-gray-300 flex gap-1.5">
                <span style={{ color: borderColor }}>›</span>{actie}
              </li>
            ))}
            {node.acties.length > 4 && <li className="text-xs text-gray-500">+{node.acties.length - 4} meer</li>}
          </ul>
        </div>
      )}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
        <span className="text-xs font-medium" style={{ color: afdelingColor }}>{AFDELING_LABELS[node.primaireAfdeling]}</span>
        <span className="text-gray-700">·</span>
        <span className="text-xs text-gray-500">{KLANTREIS_LABELS[node.klantreisStatus]}</span>
      </div>
    </div>
  );
}

export default function FlowCanvas() {
  const storeNodes = useStore((state) => state.nodes);
  const storeEdges = useStore((state) => state.edges);
  const setSelectedNode = useStore((state) => state.setSelectedNode);
  const updateNode = useStore((state) => state.updateNode);
  const filteredNodes = useFilteredNodes();
  const { fitView } = useReactFlow();

  const [nodes, setNodes] = useState<Node[]>(() => buildFlowNodes(filteredNodes, storeNodes, storeEdges));
  const [edges, setEdges] = useState<Edge[]>(() => {
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    return convertEdges(storeEdges, nodeIds);
  });

  // Presentatie state
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [presentationIndex, setPresentationIndex] = useState(0);
  const [presentationPhase, setPresentationPhase] = useState<'overview' | 'node'>('overview');
  const [sortedNodes, setSortedNodes] = useState<ProcesNode[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const prevFilteredNodeIds = useRef<string>(filteredNodes.map((n) => n.id).sort().join(','));
  const prevStoreEdgesRef = useRef<string>(JSON.stringify(storeEdges.map((e) => e.id).sort()));

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  // Zet de presentationActive flag op alle nodes
  const applyHighlight = useCallback((activeId: string | null, inPresentation: boolean) => {
    setNodes(prev => prev.map(n => ({
      ...n,
      zIndex: n.id === activeId ? 100 : 0,
      data: {
        ...n.data,
        presentationActive: inPresentation ? n.id === activeId : undefined,
      },
    })));
  }, []);

  // Zoom smooth naar een node via fitView
  const zoomToNode = useCallback((nodeId: string, duration = 800) => {
    fitView({
      nodes: [{ id: nodeId }],
      duration,
      padding: 0.55,
      maxZoom: 1.35,
    });
  }, [fitView]);

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
      if (bigChange && newCount > 0) {
        setTimeout(() => fitView({ padding: 0.15, maxZoom: 0.8, duration: 400 }), 50);
      }
    }
  }, [filteredNodes, storeEdges, storeNodes, fitView]);

  // Keyboard navigatie
  useEffect(() => {
    if (!isPresentationMode) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') exitPresentation();
      else if ((e.key === 'ArrowRight' || e.key === 'ArrowDown') && presentationPhase === 'node') navigateTo(Math.min(presentationIndex + 1, sortedNodes.length - 1));
      else if ((e.key === 'ArrowLeft' || e.key === 'ArrowUp') && presentationPhase === 'node') navigateTo(Math.max(presentationIndex - 1, 0));
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPresentationMode, presentationIndex, presentationPhase, sortedNodes]);

  const enterPresentation = useCallback(() => {
    if (filteredNodes.length === 0) return;
    clearTimers();

    const sorted = sortNodesByFlow(filteredNodes, storeEdges);
    setSortedNodes(sorted);
    setIsPresentationMode(true);
    setPresentationIndex(0);
    setPresentationPhase('overview');

    // Stap 1: alle nodes dimmen (presentatie modus aan, geen actieve node)
    setNodes(prev => prev.map(n => ({
      ...n,
      zIndex: 0,
      data: { ...n.data, presentationActive: false },
    })));

    // Stap 2: zoom uit naar overzicht
    setTimeout(() => fitView({ padding: 0.12, maxZoom: 0.75, duration: 1100 }), 50);

    // Stap 3: na 3s + zoomtijd → zoom in op node 1 + highlight
    const t1 = setTimeout(() => {
      setPresentationPhase('node');
      applyHighlight(sorted[0].id, true);
      zoomToNode(sorted[0].id, 1000);
    }, 1150 + 3000);

    timers.current.push(t1);
  }, [filteredNodes, storeEdges, fitView, applyHighlight, zoomToNode]);

  const navigateTo = useCallback((index: number) => {
    if (!sortedNodes[index]) return;
    setPresentationIndex(index);
    applyHighlight(sortedNodes[index].id, true);
    zoomToNode(sortedNodes[index].id, 750);
  }, [sortedNodes, applyHighlight, zoomToNode]);

  const exitPresentation = useCallback(() => {
    clearTimers();
    setIsPresentationMode(false);
    setPresentationPhase('overview');
    // Herstel alle nodes naar normaal
    setNodes(prev => prev.map(n => ({
      ...n,
      zIndex: 0,
      data: { ...n.data, presentationActive: undefined },
    })));
    setTimeout(() => fitView({ padding: 0.15, maxZoom: 0.8, duration: 600 }), 50);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitView]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)), []
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), []
  );
  const onNodeDragStop = useCallback((_event: React.MouseEvent, node: Node) => {
    updateNode(node.id, { position: { x: node.position.x, y: node.position.y } });
  }, [updateNode]);

  const autoLayout = useCallback(() => {
    const positions = applyDagreLayout(filteredNodes.map(n => ({ ...n, position: undefined })), storeEdges);
    filteredNodes.forEach((node) => { const pos = positions.get(node.id); if (pos) updateNode(node.id, { position: pos }); });
    setNodes(filteredNodes.map((node) => ({
      id: node.id, type: 'procesNode',
      position: positions.get(node.id) ?? { x: 0, y: 0 },
      data: { procesNode: node },
      draggable: true,
    })));
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    setEdges(convertEdges(storeEdges, nodeIds));
    setTimeout(() => fitView({ padding: 0.15, maxZoom: 0.8, duration: 400 }), 50);
  }, [filteredNodes, storeEdges, updateNode, fitView]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (isPresentationMode) return;
    const procesNode = filteredNodes.find((n) => n.id === node.id);
    if (procesNode) setSelectedNode(procesNode);
  }, [filteredNodes, setSelectedNode, isPresentationMode]);

  const onPaneClick = useCallback(() => {
    if (!isPresentationMode) setSelectedNode(null);
  }, [setSelectedNode, isPresentationMode]);

  const currentNode = sortedNodes[presentationIndex] ?? null;

  return (
    <div className="w-full h-full relative">
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
        nodesDraggable={!isPresentationMode}
        elementsSelectable={!isPresentationMode}
        panOnDrag={!isPresentationMode}
        zoomOnScroll={!isPresentationMode}
        zoomOnPinch={!isPresentationMode}
        zoomOnDoubleClick={!isPresentationMode}
      >
        <Background color="#1e293b" gap={20} />
        {!isPresentationMode && <Controls className="!shadow-md !border !border-gray-700 !bg-gray-900" />}
        {!isPresentationMode && (
          <MiniMap
            nodeColor={(node) => {
              const data = node.data as ProcessNodeData | undefined;
              const procesNode = data?.procesNode;
              return procesNode ? AFDELING_KLEUREN[procesNode.primaireAfdeling] || '#374151' : '#374151';
            }}
            maskColor="rgba(0,0,0,0.4)"
            className="!shadow-md !border !border-gray-700 !bg-gray-900"
            pannable zoomable
          />
        )}

        {!isPresentationMode && (
          <Panel position="top-left" className="bg-gray-900/90 px-3 py-2 rounded-lg shadow-sm border border-gray-700">
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-400">
                <span className="font-medium text-gray-200">{filteredNodes.length}</span> processtappen
              </div>
              <button onClick={autoLayout} className="text-xs px-2 py-1 bg-blue-900/60 hover:bg-blue-800/60 border border-blue-700 rounded text-blue-300 transition-colors">
                Auto-layout
              </button>
              {filteredNodes.length > 0 && (
                <button onClick={enterPresentation}
                  className="flex items-center gap-1.5 text-xs px-2 py-1 bg-purple-900/60 hover:bg-purple-800/60 border border-purple-700 rounded text-purple-300 transition-colors"
                  title="Presentatiemodus starten">
                  <Play className="w-3 h-3" />Presentatie
                </button>
              )}
            </div>
          </Panel>
        )}
        {!isPresentationMode && (
          <Panel position="top-right" className="bg-gray-900/90 px-3 py-2 rounded-lg shadow-sm border border-gray-700 text-xs text-gray-500">
            Sleep nodes om te verplaatsen
          </Panel>
        )}
      </ReactFlow>

      {/* ── Presentatie overlay ── */}
      {isPresentationMode && (
        <div className="absolute inset-0 pointer-events-none z-10">

          {/* Vignette */}
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%)' }} />

          {/* Overzichtslabel tijdens intro */}
          {presentationPhase === 'overview' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="bg-black/70 backdrop-blur-sm rounded-2xl px-10 py-6 text-center border border-gray-600/60"
                style={{ animation: 'fadeIn 0.6s ease' }}
              >
                <MonitorPlay className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                <p className="text-white font-bold text-xl mb-1">Presentatiemodus</p>
                <p className="text-gray-400 text-sm">{filteredNodes.length} processtappen · start automatisch</p>
              </div>
            </div>
          )}

          {/* Nodekaart */}
          {presentationPhase === 'node' && currentNode && (
            <div className="absolute bottom-28 left-6" style={{ animation: 'slideUp 0.45s ease' }}>
              <PresentationCard node={currentNode} index={presentationIndex} total={sortedNodes.length} />
            </div>
          )}

          {/* Navigatiebalk */}
          {presentationPhase === 'node' && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto">
              <div className="flex items-center gap-4 bg-gray-950/95 backdrop-blur-sm border border-gray-700 rounded-2xl px-6 py-3 shadow-2xl">
                <button onClick={() => navigateTo(Math.max(presentationIndex - 1, 0))}
                  disabled={presentationIndex === 0}
                  className="p-1.5 rounded-full hover:bg-gray-700 disabled:opacity-25 disabled:cursor-not-allowed text-gray-200 transition-colors"
                  title="Vorige (←)">
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Stippenbalk */}
                <div className="flex items-center gap-1.5">
                  {sortedNodes.map((n, i) => (
                    <button key={n.id}
                      onClick={() => navigateTo(i)}
                      className="rounded-full transition-all duration-300"
                      style={{
                        width: i === presentationIndex ? 22 : 8,
                        height: 8,
                        backgroundColor: i === presentationIndex
                          ? (FASE_KLEUREN[n.fase] || '#a855f7')
                          : '#374151',
                        boxShadow: i === presentationIndex
                          ? `0 0 8px ${FASE_KLEUREN[n.fase] || '#a855f7'}` : undefined,
                      }}
                      title={n.titel}
                    />
                  ))}
                </div>

                <button onClick={() => navigateTo(Math.min(presentationIndex + 1, sortedNodes.length - 1))}
                  disabled={presentationIndex === sortedNodes.length - 1}
                  className="p-1.5 rounded-full hover:bg-gray-700 disabled:opacity-25 disabled:cursor-not-allowed text-gray-200 transition-colors"
                  title="Volgende (→)">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Sluitknop */}
          <div className="absolute top-4 right-4 pointer-events-auto">
            <button onClick={exitPresentation}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-950/95 backdrop-blur-sm border border-gray-700 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-sm shadow-lg">
              <X className="w-4 h-4" />Sluiten
            </button>
          </div>
        </div>
      )}

      {/* CSS animaties */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
