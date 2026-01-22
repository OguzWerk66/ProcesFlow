import { useState } from 'react';
import { X, Edit3, Save, XCircle, Trash2, Link, Play, StopCircle, HelpCircle, Cog, Layers, ArrowRight } from 'lucide-react';
import { useDecisionFlowchartStore } from '../../store/useDecisionFlowchartStore';
import { useAfdelingLabels } from '../../store/useFilterConfigStore';
import { ConfirmDialog } from '../dialogs';
import type { DecisionNode } from '../../types/decisionFlowchart';
import { DECISION_NODE_LABELS } from '../../types/decisionFlowchart';

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'green' | 'red' | 'amber' | 'blue' | 'purple' }) {
  const colors = {
    default: 'bg-slate-100 text-slate-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  };

  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${colors[variant]}`}>
      {children}
    </span>
  );
}

const NODE_TYPE_ICONS: Record<string, React.ReactNode> = {
  start: <Play className="w-4 h-4 text-green-600" />,
  end: <StopCircle className="w-4 h-4 text-red-600" />,
  decision: <HelpCircle className="w-4 h-4 text-amber-600" />,
  action: <Cog className="w-4 h-4 text-blue-600" />,
  subprocess: <Layers className="w-4 h-4 text-purple-600" />,
};

const NODE_TYPE_COLORS: Record<string, 'green' | 'red' | 'amber' | 'blue' | 'purple'> = {
  start: 'green',
  end: 'red',
  decision: 'amber',
  action: 'blue',
  subprocess: 'purple',
};

interface DecisionDetailPanelProps {
  onAddEdge?: () => void;
}

export default function DecisionDetailPanel({ onAddEdge }: DecisionDetailPanelProps) {
  const selectedNode = useDecisionFlowchartStore((state) => state.selectedNode);
  const setSelectedNode = useDecisionFlowchartStore((state) => state.setSelectedNode);
  const updateNode = useDecisionFlowchartStore((state) => state.updateNode);
  const deleteNode = useDecisionFlowchartStore((state) => state.deleteNode);
  const deleteEdge = useDecisionFlowchartStore((state) => state.deleteEdge);
  const nodes = useDecisionFlowchartStore((state) => state.nodes);
  const edges = useDecisionFlowchartStore((state) => state.edges);
  const afdelingLabels = useAfdelingLabels();

  const [isEditing, setIsEditing] = useState(false);
  const [editedNode, setEditedNode] = useState<DecisionNode | null>(null);
  const [deleteNodeConfirm, setDeleteNodeConfirm] = useState(false);
  const [deleteEdgeConfirm, setDeleteEdgeConfirm] = useState<string | null>(null);

  if (!selectedNode) {
    return null;
  }

  const node = isEditing && editedNode ? editedNode : selectedNode;

  // Vind gerelateerde nodes via edges
  const outgoingEdges = edges.filter((e) => e.van === node.id);
  const incomingEdges = edges.filter((e) => e.naar === node.id);

  const getNodeById = (id: string) => nodes.find((n) => n.id === id);

  const startEditing = () => {
    setEditedNode({ ...selectedNode });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditedNode(null);
    setIsEditing(false);
  };

  const saveChanges = () => {
    if (editedNode) {
      updateNode(editedNode.id, editedNode);
      setSelectedNode(editedNode);
      setEditedNode(null);
      setIsEditing(false);
    }
  };

  const updateField = <K extends keyof DecisionNode>(field: K, value: DecisionNode[K]) => {
    if (editedNode) {
      setEditedNode({ ...editedNode, [field]: value });
    }
  };

  const handleClose = () => {
    setSelectedNode(null);
    setIsEditing(false);
    setEditedNode(null);
  };

  const handleDelete = () => {
    deleteNode(node.id);
    setDeleteNodeConfirm(false);
    setSelectedNode(null);
  };

  return (
    <aside className="w-80 bg-white border-l border-slate-200 h-full flex flex-col overflow-hidden shadow-lg">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {NODE_TYPE_ICONS[node.type]}
              <Badge variant={NODE_TYPE_COLORS[node.type]}>
                {DECISION_NODE_LABELS[node.type]}
              </Badge>
              <span className="text-xs text-slate-400">{node.id}</span>
            </div>
            {isEditing ? (
              <input
                type="text"
                value={editedNode?.titel || ''}
                onChange={(e) => updateField('titel', e.target.value)}
                className="w-full font-semibold text-slate-900 text-lg px-2 py-1 border border-purple-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            ) : (
              <h2 className="font-semibold text-slate-900 text-lg leading-tight">
                {node.titel}
              </h2>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            {!isEditing && (
              <>
                <button
                  onClick={() => onAddEdge?.()}
                  className="p-1.5 hover:bg-purple-50 rounded text-purple-600"
                  title="Verbinding toevoegen"
                >
                  <Link className="w-4 h-4" />
                </button>
                <button
                  onClick={startEditing}
                  className="p-1.5 hover:bg-blue-50 rounded text-blue-600"
                  title="Bewerken"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteNodeConfirm(true)}
                  className="p-1.5 hover:bg-red-50 rounded text-red-600"
                  title="Verwijderen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={handleClose}
              className="p-1 hover:bg-slate-100 rounded"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Edit mode buttons */}
        {isEditing && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200">
            <button
              onClick={saveChanges}
              className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
            >
              <Save className="w-4 h-4" /> Opslaan
            </button>
            <button
              onClick={cancelEditing}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded hover:bg-slate-200"
            >
              <XCircle className="w-4 h-4" /> Annuleren
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Vraag voor decision nodes */}
        {node.type === 'decision' && (
          <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <div className="text-xs font-medium text-amber-600 mb-1">Ja/Nee Vraag</div>
            {isEditing ? (
              <textarea
                value={editedNode?.vraag || ''}
                onChange={(e) => updateField('vraag', e.target.value)}
                className="w-full px-2 py-1 text-sm border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500 resize-y min-h-[60px]"
                placeholder="De vraag die met Ja of Nee beantwoord wordt..."
              />
            ) : (
              <p className="text-sm text-amber-900">{node.vraag || <span className="text-amber-400 italic">Geen vraag ingesteld</span>}</p>
            )}
          </div>
        )}

        {/* Beschrijving */}
        <div className="mb-4">
          <div className="text-xs font-medium text-slate-500 mb-1">Beschrijving</div>
          {isEditing ? (
            <textarea
              value={editedNode?.beschrijving || ''}
              onChange={(e) => updateField('beschrijving', e.target.value)}
              className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y min-h-[60px]"
              placeholder="Optionele beschrijving..."
            />
          ) : (
            <p className="text-sm text-slate-700">{node.beschrijving || <span className="text-slate-400 italic">Geen beschrijving</span>}</p>
          )}
        </div>

        {/* Afdeling voor action en subprocess */}
        {(node.type === 'action' || node.type === 'subprocess') && (
          <div className="mb-4">
            <div className="text-xs font-medium text-slate-500 mb-1">Verantwoordelijke afdeling</div>
            {isEditing ? (
              <select
                value={editedNode?.afdeling || ''}
                onChange={(e) => updateField('afdeling', e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">-- Geen afdeling --</option>
                {Object.entries(afdelingLabels).map(([id, label]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            ) : (
              <p className="text-sm">
                {node.afdeling ? (
                  <Badge>{afdelingLabels[node.afdeling] || node.afdeling}</Badge>
                ) : (
                  <span className="text-slate-400 italic">Geen afdeling</span>
                )}
              </p>
            )}
          </div>
        )}

        {/* Verbindingen */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <h3 className="font-semibold text-slate-800 text-sm">Verbindingen</h3>
          </div>

          {incomingEdges.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1">Komt van:</div>
              <div className="space-y-1">
                {incomingEdges.map((edge) => {
                  const sourceNode = getNodeById(edge.van);
                  return (
                    <div key={edge.id} className="text-xs p-2 bg-slate-50 rounded flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                        {sourceNode && NODE_TYPE_ICONS[sourceNode.type]}
                        <span>{sourceNode?.titel || edge.van}</span>
                        {edge.label && (
                          <Badge variant={edge.type === 'ja' ? 'green' : edge.type === 'nee' ? 'red' : 'default'}>
                            {edge.label}
                          </Badge>
                        )}
                      </div>
                      <button
                        onClick={() => setDeleteEdgeConfirm(edge.id)}
                        className="p-1 hover:bg-red-100 rounded text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Verbinding verwijderen"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {outgoingEdges.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-slate-500 mb-1">Gaat naar:</div>
              <div className="space-y-1">
                {outgoingEdges.map((edge) => {
                  const targetNode = getNodeById(edge.naar);
                  return (
                    <div key={edge.id} className="text-xs p-2 bg-slate-50 rounded flex items-center justify-between group">
                      <div className="flex items-center gap-2">
                        {targetNode && NODE_TYPE_ICONS[targetNode.type]}
                        <span>{targetNode?.titel || edge.naar}</span>
                        {edge.label && (
                          <Badge variant={edge.type === 'ja' ? 'green' : edge.type === 'nee' ? 'red' : 'default'}>
                            {edge.label}
                          </Badge>
                        )}
                      </div>
                      <button
                        onClick={() => setDeleteEdgeConfirm(edge.id)}
                        className="p-1 hover:bg-red-100 rounded text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Verbinding verwijderen"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {incomingEdges.length === 0 && outgoingEdges.length === 0 && (
            <p className="text-xs text-slate-400 italic mb-2">Geen verbindingen</p>
          )}

          <button
            onClick={() => onAddEdge?.()}
            className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 px-2 py-1 hover:bg-purple-50 rounded"
          >
            <Link className="w-3 h-3" /> Nieuwe verbinding toevoegen
          </button>
        </div>

        {/* Subprocess koppeling info */}
        {node.type === 'subprocess' && (node.linkedProcessId || node.linkedFlowchartId) && (
          <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
            <div className="text-xs font-medium text-purple-600 mb-1">Koppeling</div>
            {node.linkedProcessId && (
              <p className="text-sm text-purple-900">Gekoppeld aan proces: {node.linkedProcessId}</p>
            )}
            {node.linkedFlowchartId && (
              <p className="text-sm text-purple-900">Gekoppeld aan flowchart: {node.linkedFlowchartId}</p>
            )}
          </div>
        )}
      </div>

      {/* Confirm dialogs */}
      <ConfirmDialog
        isOpen={deleteNodeConfirm}
        onClose={() => setDeleteNodeConfirm(false)}
        onConfirm={handleDelete}
        title="Stap verwijderen"
        message={`Weet je zeker dat je "${node.titel}" wilt verwijderen? Alle verbindingen met deze stap worden ook verwijderd.`}
        confirmLabel="Verwijderen"
        confirmVariant="danger"
      />

      <ConfirmDialog
        isOpen={deleteEdgeConfirm !== null}
        onClose={() => setDeleteEdgeConfirm(null)}
        onConfirm={() => {
          if (deleteEdgeConfirm) {
            deleteEdge(deleteEdgeConfirm);
            setDeleteEdgeConfirm(null);
          }
        }}
        title="Verbinding verwijderen"
        message="Weet je zeker dat je deze verbinding wilt verwijderen?"
        confirmLabel="Verwijderen"
        confirmVariant="danger"
      />
    </aside>
  );
}
