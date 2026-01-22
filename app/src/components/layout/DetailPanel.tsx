import { useState } from 'react';
import { X, Clock, Users, FileText, AlertTriangle, ArrowRight, Database, BookOpen, Edit3, Save, XCircle, Plus, Trash2, Link } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { AFDELING_LABELS, KLANTREIS_LABELS, PROCESFASE_LABELS, FASE_LABELS } from '../../types';
import type { ProcesNode } from '../../types';
import { ConfirmDialog } from '../dialogs';

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function Section({ title, icon, children }: SectionProps) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
      </div>
      <div className="pl-6">{children}</div>
    </div>
  );
}

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'info' | 'warning' | 'error' }) {
  const colors = {
    default: 'bg-slate-100 text-slate-700',
    info: 'bg-blue-100 text-blue-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${colors[variant]}`}>
      {children}
    </span>
  );
}

// Editable text input component
function EditableText({
  value,
  onChange,
  isEditing,
  multiline = false,
  placeholder = '',
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  isEditing: boolean;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
}) {
  if (!isEditing) {
    return <span className={className}>{value || <span className="text-slate-400 italic">{placeholder}</span>}</span>;
  }

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[60px] ${className}`}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    />
  );
}

// Editable list component
function EditableList({
  items,
  onChange,
  isEditing,
  placeholder = 'Nieuw item',
}: {
  items: string[];
  onChange: (items: string[]) => void;
  isEditing: boolean;
  placeholder?: string;
}) {
  const addItem = () => {
    onChange([...items, '']);
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange(newItems);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  if (!isEditing) {
    return (
      <ul className="text-sm space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-slate-400">•</span>
            <span className="text-slate-700">{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => updateItem(i, e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => removeItem(i)}
            className="p-1 text-red-500 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        onClick={addItem}
        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 px-2 py-1 hover:bg-blue-50 rounded"
      >
        <Plus className="w-3 h-3" /> Toevoegen
      </button>
    </div>
  );
}

interface DetailPanelProps {
  onAddEdge?: (sourceNodeId: string) => void;
}

export default function DetailPanel({ onAddEdge }: DetailPanelProps) {
  const selectedNode = useStore((state) => state.selectedNode);
  const isDetailPanelOpen = useStore((state) => state.isDetailPanelOpen);
  const closeDetailPanel = useStore((state) => state.closeDetailPanel);
  const updateNode = useStore((state) => state.updateNode);
  const deleteNode = useStore((state) => state.deleteNode);
  const deleteEdge = useStore((state) => state.deleteEdge);
  const setSelectedNode = useStore((state) => state.setSelectedNode);
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  const user = useStore((state) => state.user);

  const [isEditing, setIsEditing] = useState(false);
  const [editedNode, setEditedNode] = useState<ProcesNode | null>(null);
  const [deleteNodeConfirm, setDeleteNodeConfirm] = useState(false);
  const [deleteEdgeConfirm, setDeleteEdgeConfirm] = useState<string | null>(null);

  const canEdit = user?.rol === 'editor' || user?.rol === 'admin';

  if (!isDetailPanelOpen || !selectedNode) {
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
      // Update versie info
      const updatedNode: ProcesNode = {
        ...editedNode,
        versie: {
          ...editedNode.versie,
          laatstGewijzigd: new Date().toISOString().split('T')[0],
        },
      };
      updateNode(editedNode.id, updatedNode);
      setSelectedNode(updatedNode);
      setEditedNode(null);
      setIsEditing(false);
    }
  };

  const updateField = <K extends keyof ProcesNode>(field: K, value: ProcesNode[K]) => {
    if (editedNode) {
      setEditedNode({ ...editedNode, [field]: value });
    }
  };

  return (
    <aside className="w-96 bg-white border-l border-slate-200 h-full flex flex-col overflow-hidden shadow-lg">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="info">
                {FASE_LABELS[node.fase]}
              </Badge>
              <span className="text-xs text-slate-400">{node.id}</span>
            </div>
            {isEditing ? (
              <input
                type="text"
                value={editedNode?.titel || ''}
                onChange={(e) => updateField('titel', e.target.value)}
                className="w-full font-semibold text-slate-900 text-lg px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <h2 className="font-semibold text-slate-900 text-lg leading-tight">
                {node.titel}
              </h2>
            )}
            {isEditing ? (
              <textarea
                value={editedNode?.korteBeschrijving || ''}
                onChange={(e) => updateField('korteBeschrijving', e.target.value)}
                className="w-full text-sm text-slate-600 mt-1 px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[40px]"
              />
            ) : (
              <p className="text-sm text-slate-600 mt-1">{node.korteBeschrijving}</p>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            {canEdit && !isEditing && (
              <>
                <button
                  onClick={() => onAddEdge?.(node.id)}
                  className="p-1.5 hover:bg-purple-50 rounded text-purple-600"
                  title="Link toevoegen vanaf deze stap"
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
              onClick={closeDetailPanel}
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
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
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
        {/* Metadata badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge>{KLANTREIS_LABELS[node.klantreisStatus]}</Badge>
          <Badge>{PROCESFASE_LABELS[node.procesFase]}</Badge>
          <Badge>{AFDELING_LABELS[node.primaireAfdeling]}</Badge>
        </div>

        {/* Trigger */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="text-xs font-medium text-blue-600 mb-1">Trigger</div>
          <EditableText
            value={node.trigger}
            onChange={(value) => updateField('trigger', value)}
            isEditing={isEditing}
            multiline
            className="text-sm text-blue-900"
          />
        </div>

        {/* Doorlooptijd */}
        {(node.doorlooptijd || isEditing) && (
          <Section title="Doorlooptijd" icon={<Clock className="w-4 h-4 text-slate-400" />}>
            <div className="text-sm space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 w-20">Standaard:</span>
                <EditableText
                  value={node.doorlooptijd?.standaard || ''}
                  onChange={(value) => updateField('doorlooptijd', { ...node.doorlooptijd, standaard: value, maximum: node.doorlooptijd?.maximum || '' })}
                  isEditing={isEditing}
                  placeholder="bv. 2 werkdagen"
                  className="font-medium"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 w-20">Maximum:</span>
                <EditableText
                  value={node.doorlooptijd?.maximum || ''}
                  onChange={(value) => updateField('doorlooptijd', { ...node.doorlooptijd, standaard: node.doorlooptijd?.standaard || '', maximum: value })}
                  isEditing={isEditing}
                  placeholder="bv. 5 werkdagen"
                  className="font-medium"
                />
              </div>
              {(node.doorlooptijd?.escalatieBij || isEditing) && (
                <div className="flex items-start gap-2">
                  <span className="text-slate-500 w-20 flex-shrink-0">Escalatie:</span>
                  <EditableText
                    value={node.doorlooptijd?.escalatieBij || ''}
                    onChange={(value) => updateField('doorlooptijd', { ...node.doorlooptijd, standaard: node.doorlooptijd?.standaard || '', maximum: node.doorlooptijd?.maximum || '', escalatieBij: value })}
                    isEditing={isEditing}
                    placeholder="Wanneer escaleren?"
                    className="text-amber-600 text-xs"
                  />
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Acties */}
        {(node.acties.length > 0 || isEditing) && (
          <Section title="Acties" icon={<FileText className="w-4 h-4 text-slate-400" />}>
            <EditableList
              items={node.acties}
              onChange={(items) => updateField('acties', items)}
              isEditing={isEditing}
              placeholder="Nieuwe actie"
            />
          </Section>
        )}

        {/* RACI */}
        {node.raci.length > 0 && (
          <Section title="RACI" icon={<Users className="w-4 h-4 text-slate-400" />}>
            <div className="space-y-2">
              {['R', 'A', 'C', 'I'].map((type) => {
                const entries = node.raci.filter((r) => r.type === type);
                if (entries.length === 0) return null;
                return (
                  <div key={type} className="text-sm">
                    <span className="font-medium text-slate-700 w-24 inline-block">
                      {type === 'R' && 'Responsible'}
                      {type === 'A' && 'Accountable'}
                      {type === 'C' && 'Consulted'}
                      {type === 'I' && 'Informed'}
                    </span>
                    <div className="pl-4">
                      {entries.map((entry, i) => (
                        <div key={i} className="text-slate-600">
                          {entry.rol} ({AFDELING_LABELS[entry.afdeling]})
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Inputs & Outputs */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {(node.inputs.length > 0 || isEditing) && (
            <div>
              <h4 className="text-xs font-medium text-slate-500 mb-1">Inputs</h4>
              {isEditing ? (
                <EditableList
                  items={node.inputs}
                  onChange={(items) => updateField('inputs', items)}
                  isEditing={isEditing}
                  placeholder="Nieuwe input"
                />
              ) : (
                <ul className="text-xs space-y-0.5">
                  {node.inputs.map((input, i) => (
                    <li key={i} className="text-slate-600">• {input}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {(node.outputs.length > 0 || isEditing) && (
            <div>
              <h4 className="text-xs font-medium text-slate-500 mb-1">Outputs</h4>
              {isEditing ? (
                <EditableList
                  items={node.outputs}
                  onChange={(items) => updateField('outputs', items)}
                  isEditing={isEditing}
                  placeholder="Nieuwe output"
                />
              ) : (
                <ul className="text-xs space-y-0.5">
                  {node.outputs.map((output, i) => (
                    <li key={i} className="text-slate-600">• {output}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Uitzonderingen */}
        {node.uitzonderingen.length > 0 && (
          <Section title="Uitzonderingen" icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}>
            <div className="space-y-2">
              {node.uitzonderingen.map((uitzondering) => (
                <div key={uitzondering.id} className="text-sm p-2 bg-amber-50 rounded border border-amber-100">
                  <div className="font-medium text-amber-800">{uitzondering.conditie}</div>
                  <div className="text-amber-700 text-xs mt-1">{uitzondering.actie}</div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Handovers / Verbindingen */}
        {(outgoingEdges.length > 0 || incomingEdges.length > 0 || canEdit) && (
          <Section title="Verbindingen" icon={<ArrowRight className="w-4 h-4 text-slate-400" />}>
            {incomingEdges.length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-slate-500 mb-1">Komt van:</div>
                <div className="space-y-1">
                  {incomingEdges.map((edge) => {
                    const sourceNode = getNodeById(edge.van);
                    return (
                      <div key={edge.id} className="text-xs p-1.5 bg-slate-50 rounded flex items-center justify-between group">
                        <div>
                          {sourceNode?.titel || edge.van}
                          {edge.label && <span className="text-slate-400"> ({edge.label})</span>}
                        </div>
                        {canEdit && (
                          <button
                            onClick={() => setDeleteEdgeConfirm(edge.id)}
                            className="p-1 hover:bg-red-100 rounded text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Link verwijderen"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {outgoingEdges.length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-slate-500 mb-1">Gaat naar:</div>
                <div className="space-y-1">
                  {outgoingEdges.map((edge) => {
                    const targetNode = getNodeById(edge.naar);
                    return (
                      <div key={edge.id} className="text-xs p-1.5 bg-slate-50 rounded flex items-center justify-between group">
                        <div>
                          {targetNode?.titel || edge.naar}
                          {edge.label && <span className="text-slate-400"> ({edge.label})</span>}
                        </div>
                        {canEdit && (
                          <button
                            onClick={() => setDeleteEdgeConfirm(edge.id)}
                            className="p-1 hover:bg-red-100 rounded text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Link verwijderen"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {canEdit && (
              <button
                onClick={() => onAddEdge?.(node.id)}
                className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 px-2 py-1 hover:bg-purple-50 rounded mt-2"
              >
                <Plus className="w-3 h-3" /> Nieuwe link toevoegen
              </button>
            )}
          </Section>
        )}

        {/* Registraties */}
        {node.registraties.length > 0 && (
          <Section title="Registraties" icon={<Database className="w-4 h-4 text-slate-400" />}>
            <div className="space-y-1">
              {node.registraties.map((reg, i) => (
                <div key={i} className="text-xs p-1.5 bg-slate-50 rounded flex items-center gap-2">
                  <Badge>{reg.systeem}</Badge>
                  <span className="text-slate-600">{reg.actie}</span>
                  {reg.verplicht && <span className="text-red-500">*</span>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Reglement Referenties */}
        {node.reglementReferenties.length > 0 && (
          <Section title="Reglement" icon={<BookOpen className="w-4 h-4 text-slate-400" />}>
            <div className="space-y-1">
              {node.reglementReferenties.map((ref, i) => (
                <div key={i} className="text-xs p-1.5 bg-slate-50 rounded">
                  <div className="font-medium text-slate-700">
                    {ref.document} - Art. {ref.artikel}
                  </div>
                  <div className="text-slate-500">{ref.omschrijving}</div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Versie info */}
        <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
          <div>Versie: {node.versie.versie}</div>
          <div>Status: {node.versie.status}</div>
          <div>Laatst gewijzigd: {node.versie.laatstGewijzigd}</div>
        </div>
      </div>

      {/* Confirm dialogs */}
      <ConfirmDialog
        isOpen={deleteNodeConfirm}
        onClose={() => setDeleteNodeConfirm(false)}
        onConfirm={() => deleteNode(node.id)}
        title="Processtap verwijderen"
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
