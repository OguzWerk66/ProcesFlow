import { useState, useEffect } from 'react';
import { X, Link, Save } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type { EdgeType } from '../../types';

const EDGE_TYPE_OPTIONS: { value: EdgeType; label: string; color: string }[] = [
  { value: 'standaard', label: 'Standaard', color: '#64748b' },
  { value: 'escalatie', label: 'Escalatie', color: '#ef4444' },
  { value: 'uitzondering', label: 'Uitzondering', color: '#f59e0b' },
  { value: 'terugkoppeling', label: 'Terugkoppeling', color: '#8b5cf6' },
];

export default function EdgeEditDialog() {
  const selectedEdgeId = useStore((state) => state.selectedEdgeId);
  const edges = useStore((state) => state.edges);
  const nodes = useStore((state) => state.nodes);
  const setSelectedEdge = useStore((state) => state.setSelectedEdge);
  const updateEdge = useStore((state) => state.updateEdge);

  const [label, setLabel] = useState('');
  const [conditie, setConditie] = useState('');
  const [edgeType, setEdgeType] = useState<EdgeType>('standaard');

  const edge = edges.find((e) => e.id === selectedEdgeId);
  const sourceNode = edge ? nodes.find((n) => n.id === edge.van) : null;
  const targetNode = edge ? nodes.find((n) => n.id === edge.naar) : null;

  useEffect(() => {
    if (edge) {
      setLabel(edge.label || '');
      setConditie(edge.conditie || '');
      setEdgeType(edge.type);
    }
  }, [edge]);

  if (!selectedEdgeId || !edge) {
    return null;
  }

  const handleClose = () => {
    setSelectedEdge(null);
  };

  const handleSave = () => {
    updateEdge(selectedEdgeId, {
      label: label || undefined,
      conditie: conditie || undefined,
      type: edgeType,
    });
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Link size={20} className="text-blue-600" />
            Link bewerken
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Verbinding info */}
          <div className="p-3 bg-slate-50 rounded-lg text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="font-medium">{sourceNode?.titel || edge.van}</span>
              <span className="text-slate-400">→</span>
              <span className="font-medium">{targetNode?.titel || edge.naar}</span>
            </div>
          </div>

          {/* Type selectie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type verbinding
            </label>
            <div className="grid grid-cols-2 gap-2">
              {EDGE_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setEdgeType(option.value)}
                  className={`p-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    edgeType === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: option.color }}
                    />
                    {option.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Label */}
          <div>
            <label htmlFor="edge-label" className="block text-sm font-medium text-gray-700 mb-1">
              Label (optioneel)
            </label>
            <input
              id="edge-label"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="bv. Goedgekeurd, Afgewezen..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Conditie */}
          <div>
            <label htmlFor="edge-conditie" className="block text-sm font-medium text-gray-700 mb-1">
              Conditie (optioneel)
            </label>
            <textarea
              id="edge-conditie"
              value={conditie}
              onChange={(e) => setConditie(e.target.value)}
              placeholder="Wanneer wordt deze verbinding gevolgd?"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Save size={16} />
            Opslaan
          </button>
        </div>
      </div>
    </div>
  );
}
