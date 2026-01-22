import { useState, useEffect, useMemo } from 'react';
import { X, Plus, ArrowRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { ProcesEdge, EdgeType } from '../../types';

interface EdgeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sourceNodeId?: string | null;
}

const EDGE_TYPE_OPTIONS: { value: EdgeType; label: string; color: string }[] = [
  { value: 'standaard', label: 'Standaard', color: 'bg-slate-100 text-slate-700' },
  { value: 'uitzondering', label: 'Uitzondering', color: 'bg-amber-100 text-amber-700' },
  { value: 'escalatie', label: 'Escalatie', color: 'bg-red-100 text-red-700' },
  { value: 'terugkoppeling', label: 'Terugkoppeling', color: 'bg-purple-100 text-purple-700' },
];

function generateEdgeId(edges: ProcesEdge[]): string {
  const existingIds = edges
    .map(e => {
      const match = e.id.match(/^E(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    });

  const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
  return `E${String(maxId + 1).padStart(3, '0')}`;
}

export default function EdgeDialog({ isOpen, onClose, sourceNodeId }: EdgeDialogProps) {
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  const addEdge = useStore((state) => state.addEdge);

  const [formData, setFormData] = useState({
    van: '',
    naar: '',
    label: '',
    conditie: '',
    type: 'standaard' as EdgeType,
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        van: sourceNodeId || '',
        naar: '',
        label: '',
        conditie: '',
        type: 'standaard',
      });
      setError(null);
    }
  }, [isOpen, sourceNodeId]);

  const sortedNodes = useMemo(() => {
    return [...nodes].sort((a, b) => a.titel.localeCompare(b.titel));
  }, [nodes]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.van || !formData.naar) {
      setError('Selecteer zowel een bron- als doelstap');
      return;
    }

    if (formData.van === formData.naar) {
      setError('Een link kan niet naar dezelfde stap wijzen');
      return;
    }

    // Check if edge already exists
    const existingEdge = edges.find(
      e => e.van === formData.van && e.naar === formData.naar
    );
    if (existingEdge) {
      setError('Er bestaat al een link tussen deze stappen');
      return;
    }

    const newEdge: ProcesEdge = {
      id: generateEdgeId(edges),
      van: formData.van,
      naar: formData.naar,
      label: formData.label || undefined,
      conditie: formData.conditie || undefined,
      type: formData.type,
    };

    addEdge(newEdge);
    onClose();
  };

  const sourceNode = nodes.find(n => n.id === formData.van);
  const targetNode = nodes.find(n => n.id === formData.naar);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Nieuwe link aanmaken
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Visual preview */}
            {formData.van && formData.naar && (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-center gap-3 text-sm">
                  <div className="px-3 py-2 bg-white rounded border border-slate-300 max-w-[180px] truncate">
                    {sourceNode?.titel || formData.van}
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <div className="px-3 py-2 bg-white rounded border border-slate-300 max-w-[180px] truncate">
                    {targetNode?.titel || formData.naar}
                  </div>
                </div>
              </div>
            )}

            {/* Source node */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Van processtap *
              </label>
              <select
                value={formData.van}
                onChange={(e) => setFormData(prev => ({ ...prev, van: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecteer een processtap...</option>
                {sortedNodes.map(node => (
                  <option key={node.id} value={node.id}>
                    {node.id} - {node.titel}
                  </option>
                ))}
              </select>
            </div>

            {/* Target node */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Naar processtap *
              </label>
              <select
                value={formData.naar}
                onChange={(e) => setFormData(prev => ({ ...prev, naar: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecteer een processtap...</option>
                {sortedNodes
                  .filter(n => n.id !== formData.van)
                  .map(node => (
                    <option key={node.id} value={node.id}>
                      {node.id} - {node.titel}
                    </option>
                  ))}
              </select>
            </div>

            {/* Edge type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Type verbinding
              </label>
              <div className="flex flex-wrap gap-2">
                {EDGE_TYPE_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: option.value }))}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      formData.type === option.value
                        ? `${option.color} ring-2 ring-offset-1 ring-blue-500`
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Label */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Label
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Korte beschrijving van de overgang"
              />
            </div>

            {/* Conditie */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Conditie
              </label>
              <input
                type="text"
                value={formData.conditie}
                onChange={(e) => setFormData(prev => ({ ...prev, conditie: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Voorwaarde voor deze overgang (optioneel)"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Annuleren
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Link aanmaken
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
