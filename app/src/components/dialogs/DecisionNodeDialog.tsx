import { useState, useEffect } from 'react';
import { X, Plus, Play, StopCircle, HelpCircle, Cog, Layers } from 'lucide-react';
import { useDecisionFlowchartStore } from '../../store/useDecisionFlowchartStore';
import { useFilterConfigStore } from '../../store/useFilterConfigStore';
import type { DecisionNode, DecisionNodeType } from '../../types/decisionFlowchart';
import { DECISION_NODE_LABELS } from '../../types/decisionFlowchart';

interface DecisionNodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editNode?: DecisionNode | null;
  defaultType?: DecisionNodeType;
}

const NODE_TYPE_OPTIONS: DecisionNodeType[] = ['start', 'end', 'decision', 'action', 'subprocess'];

const NODE_TYPE_ICONS: Record<DecisionNodeType, React.ReactNode> = {
  start: <Play className="w-4 h-4 text-green-500" />,
  end: <StopCircle className="w-4 h-4 text-red-500" />,
  decision: <HelpCircle className="w-4 h-4 text-amber-500" />,
  action: <Cog className="w-4 h-4 text-blue-500" />,
  subprocess: <Layers className="w-4 h-4 text-purple-500" />,
};

function generateNodeId(type: DecisionNodeType): string {
  const prefixMap: Record<DecisionNodeType, string> = {
    'start': 'START',
    'end': 'END',
    'decision': 'DEC',
    'action': 'ACT',
    'subprocess': 'SUB',
  };

  const prefix = prefixMap[type];
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 4);
  return `${prefix}-${timestamp}-${random}`;
}

export default function DecisionNodeDialog({ isOpen, onClose, editNode, defaultType }: DecisionNodeDialogProps) {
  const addNode = useDecisionFlowchartStore((state) => state.addNode);
  const updateNode = useDecisionFlowchartStore((state) => state.updateNode);

  const afdelingenCategorie = useFilterConfigStore((state) => state.config.afdelingen);
  const afdelingOpties = [...afdelingenCategorie.opties]
    .filter(o => o.actief)
    .sort((a, b) => a.volgorde - b.volgorde);

  const [formData, setFormData] = useState<Partial<DecisionNode>>({
    type: defaultType || 'action',
    titel: '',
    beschrijving: '',
    afdeling: '',
    vraag: '',
  });

  useEffect(() => {
    if (editNode) {
      setFormData({
        type: editNode.type,
        titel: editNode.titel,
        beschrijving: editNode.beschrijving || '',
        afdeling: editNode.afdeling || '',
        vraag: editNode.vraag || '',
        linkedProcessId: editNode.linkedProcessId,
        linkedFlowchartId: editNode.linkedFlowchartId,
      });
    } else {
      setFormData({
        type: defaultType || 'action',
        titel: '',
        beschrijving: '',
        afdeling: '',
        vraag: '',
      });
    }
  }, [editNode, isOpen, defaultType]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titel || !formData.type) {
      return;
    }

    if (editNode) {
      updateNode(editNode.id, {
        type: formData.type,
        titel: formData.titel,
        beschrijving: formData.beschrijving,
        afdeling: formData.afdeling,
        vraag: formData.vraag,
        linkedProcessId: formData.linkedProcessId,
        linkedFlowchartId: formData.linkedFlowchartId,
      });
    } else {
      const newNode: DecisionNode = {
        id: generateNodeId(formData.type as DecisionNodeType),
        type: formData.type as DecisionNodeType,
        titel: formData.titel || '',
        beschrijving: formData.beschrijving,
        afdeling: formData.afdeling,
        vraag: formData.vraag,
      };
      addNode(newNode);
    }

    onClose();
  };

  const updateField = <K extends keyof DecisionNode>(field: K, value: DecisionNode[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const showAfdelingField = formData.type === 'action' || formData.type === 'subprocess';
  const showVraagField = formData.type === 'decision';

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-gray-100">
            {editNode ? 'Stap bewerken' : 'Nieuwe stap aanmaken'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-4">
            {/* Type selectie */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Type stap *
              </label>
              <div className="grid grid-cols-5 gap-2">
                {NODE_TYPE_OPTIONS.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateField('type', type)}
                    className={`
                      flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all
                      ${formData.type === type
                        ? 'border-blue-500 bg-gray-700'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600 hover:bg-gray-700'
                      }
                    `}
                  >
                    {NODE_TYPE_ICONS[type]}
                    <span className="text-xs text-gray-400">{DECISION_NODE_LABELS[type]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Titel */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Titel *
              </label>
              <input
                type="text"
                value={formData.titel || ''}
                onChange={(e) => updateField('titel', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={
                  formData.type === 'start' ? 'Start proces' :
                  formData.type === 'end' ? 'Einde proces' :
                  formData.type === 'decision' ? 'Vraag...' :
                  formData.type === 'subprocess' ? 'Subprocess naam' :
                  'Actie beschrijving'
                }
                required
              />
            </div>

            {/* Vraag veld voor decision type */}
            {showVraagField && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Ja/Nee Vraag
                </label>
                <textarea
                  value={formData.vraag || ''}
                  onChange={(e) => updateField('vraag', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[80px]"
                  placeholder="Formuleer de vraag die met Ja of Nee beantwoord wordt..."
                />
              </div>
            )}

            {/* Beschrijving */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Beschrijving
              </label>
              <textarea
                value={formData.beschrijving || ''}
                onChange={(e) => updateField('beschrijving', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[60px]"
                placeholder="Optionele extra uitleg..."
              />
            </div>

            {/* Afdeling veld voor action en subprocess */}
            {showAfdelingField && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Verantwoordelijke afdeling
                </label>
                <select
                  value={formData.afdeling || ''}
                  onChange={(e) => updateField('afdeling', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Geen afdeling --</option>
                  {afdelingOpties.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  De kleur van het blok wordt bepaald door de afdeling
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-700 bg-gray-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Annuleren
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {editNode ? 'Opslaan' : 'Aanmaken'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
