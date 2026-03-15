import { useState, useEffect } from 'react';
import { X, Link2, ArrowRight } from 'lucide-react';
import { useDecisionFlowchartStore } from '../../store/useDecisionFlowchartStore';
import type { DecisionEdge, DecisionEdgeType, DecisionNode } from '../../types/decisionFlowchart';
import { DECISION_EDGE_LABELS, DECISION_NODE_LABELS } from '../../types/decisionFlowchart';

interface DecisionEdgeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const EDGE_TYPE_OPTIONS: DecisionEdgeType[] = ['ja', 'nee', 'standaard'];

function generateEdgeId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 4);
  return `edge-${timestamp}-${random}`;
}

export function DecisionEdgeDialog({ isOpen, onClose }: DecisionEdgeDialogProps) {
  const nodes = useDecisionFlowchartStore((state) => state.nodes);
  const edges = useDecisionFlowchartStore((state) => state.edges);
  const addEdge = useDecisionFlowchartStore((state) => state.addEdge);

  const [van, setVan] = useState('');
  const [naar, setNaar] = useState('');
  const [type, setType] = useState<DecisionEdgeType>('standaard');
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setVan('');
      setNaar('');
      setType('standaard');
      setLabel('');
      setError('');
    }
  }, [isOpen]);

  // Automatisch label instellen bij type wijziging
  useEffect(() => {
    if (type === 'ja') {
      setLabel('Ja');
    } else if (type === 'nee') {
      setLabel('Nee');
    } else if (label === 'Ja' || label === 'Nee') {
      setLabel('');
    }
  }, [type, label]);

  if (!isOpen) return null;

  // Filter nodes die als source kunnen fungeren (alles behalve 'end')
  const sourceNodes = nodes.filter(n => n.type !== 'end');

  // Filter nodes die als target kunnen fungeren (alles behalve 'start')
  const targetNodes = nodes.filter(n => n.type !== 'start');

  const getNodeLabel = (node: DecisionNode) => {
    return `${node.titel} (${DECISION_NODE_LABELS[node.type]})`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!van || !naar) {
      setError('Selecteer zowel een bron als een doel node');
      return;
    }

    if (van === naar) {
      setError('Bron en doel kunnen niet dezelfde node zijn');
      return;
    }

    // Check of deze verbinding al bestaat
    const exists = edges.some(
      edge => edge.van === van && edge.naar === naar
    );
    if (exists) {
      setError('Deze verbinding bestaat al');
      return;
    }

    const newEdge: DecisionEdge = {
      id: generateEdgeId(),
      van,
      naar,
      type,
      label: label || undefined,
    };

    addEdge(newEdge);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
            <Link2 size={20} className="text-purple-500" />
            Nieuwe verbinding
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Van node */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Van *
            </label>
            <select
              value={van}
              onChange={(e) => {
                setVan(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">-- Selecteer bron --</option>
              {sourceNodes.map(node => (
                <option key={node.id} value={node.id}>
                  {getNodeLabel(node)}
                </option>
              ))}
            </select>
          </div>

          {/* Visuele pijl */}
          <div className="flex justify-center">
            <ArrowRight className="w-6 h-6 text-gray-500" />
          </div>

          {/* Naar node */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Naar *
            </label>
            <select
              value={naar}
              onChange={(e) => {
                setNaar(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">-- Selecteer doel --</option>
              {targetNodes.map(node => (
                <option key={node.id} value={node.id}>
                  {getNodeLabel(node)}
                </option>
              ))}
            </select>
          </div>

          {/* Type verbinding */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Type verbinding
            </label>
            <div className="flex gap-3">
              {EDGE_TYPE_OPTIONS.map(edgeType => (
                <label
                  key={edgeType}
                  className={`
                    flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-all
                    ${type === edgeType
                      ? edgeType === 'ja'
                        ? 'border-green-500 bg-green-950/40'
                        : edgeType === 'nee'
                          ? 'border-red-500 bg-red-950/40'
                          : 'border-gray-500 bg-gray-700'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="edgeType"
                    value={edgeType}
                    checked={type === edgeType}
                    onChange={() => setType(edgeType)}
                    className="sr-only"
                  />
                  <span
                    className={`
                      w-3 h-3 rounded-full
                      ${edgeType === 'ja' ? 'bg-green-500' : edgeType === 'nee' ? 'bg-red-500' : 'bg-gray-400'}
                    `}
                  />
                  <span className="text-sm font-medium text-gray-300">
                    {DECISION_EDGE_LABELS[edgeType] || 'Standaard'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom label */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Label
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Optioneel label voor de verbinding"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Annuleren
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Link2 size={18} />
              Verbinden
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
