import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { useStore } from '../../store/useStore';
import type {
  ProcesNode,
  Fase,
  KlantreisStatus,
  Afdeling,
  ProcesFase,
} from '../../types';
import {
  FASE_LABELS,
  KLANTREIS_LABELS,
  AFDELING_LABELS,
  PROCESFASE_LABELS,
} from '../../types';

interface NodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editNode?: ProcesNode | null;
}

const FASE_OPTIONS: Fase[] = ['bereiken', 'boeien', 'binden', 'behouden'];
const KLANTREIS_OPTIONS: KlantreisStatus[] = ['lead', 'prospect', 'aanvrager', 'aanvrager-bestaand', 'lid', 'opzegger', 'ex-lid'];
const AFDELING_OPTIONS: Afdeling[] = ['sales', 'ledenadministratie', 'legal', 'finance', 'marcom', 'it', 'deelnemingen', 'bestuur'];
const PROCESFASE_OPTIONS: ProcesFase[] = ['leadgeneratie', 'intake', 'aanvraag', 'beoordeling', 'activatie', 'onboarding', 'lopend-lidmaatschap', 'wijzigingen', 'beeindiging'];

function generateNodeId(procesFase: ProcesFase, nodes: ProcesNode[]): string {
  const prefixMap: Record<ProcesFase, string> = {
    'leadgeneratie': 'LEAD',
    'intake': 'INT',
    'aanvraag': 'AANV',
    'beoordeling': 'BEOOR',
    'activatie': 'ACT',
    'onboarding': 'ONB',
    'lopend-lidmaatschap': 'LID',
    'wijzigingen': 'WIJZ',
    'beeindiging': 'BEEIN',
  };

  const prefix = prefixMap[procesFase] || 'NODE';
  const existingIds = nodes
    .filter(n => n.id.startsWith(prefix))
    .map(n => {
      const match = n.id.match(new RegExp(`^${prefix}-(\\d+)$`));
      return match ? parseInt(match[1], 10) : 0;
    });

  const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
  return `${prefix}-${String(maxId + 1).padStart(3, '0')}`;
}

export default function NodeDialog({ isOpen, onClose, editNode }: NodeDialogProps) {
  const nodes = useStore((state) => state.nodes);
  const addNode = useStore((state) => state.addNode);
  const updateNode = useStore((state) => state.updateNode);

  const [formData, setFormData] = useState<Partial<ProcesNode>>({
    titel: '',
    korteBeschrijving: '',
    fase: 'bereiken',
    klantreisStatus: 'lead',
    procesFase: 'leadgeneratie',
    primaireAfdeling: 'sales',
    trigger: '',
    inputs: [],
    acties: [],
    outputs: [],
    handovers: [],
    uitzonderingen: [],
    registraties: [],
    reglementReferenties: [],
    raci: [],
  });

  useEffect(() => {
    if (editNode) {
      setFormData(editNode);
    } else {
      setFormData({
        titel: '',
        korteBeschrijving: '',
        fase: 'bereiken',
        klantreisStatus: 'lead',
        procesFase: 'leadgeneratie',
        primaireAfdeling: 'sales',
        trigger: '',
        inputs: [],
        acties: [],
        outputs: [],
        handovers: [],
        uitzonderingen: [],
        registraties: [],
        reglementReferenties: [],
        raci: [],
      });
    }
  }, [editNode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titel || !formData.procesFase || !formData.primaireAfdeling || !formData.fase) {
      return;
    }

    const today = new Date().toISOString().split('T')[0];

    if (editNode) {
      const updatedNode: ProcesNode = {
        ...editNode,
        ...formData,
        versie: {
          ...editNode.versie,
          laatstGewijzigd: today,
        },
      } as ProcesNode;
      updateNode(editNode.id, updatedNode);
    } else {
      const nodeId = generateNodeId(formData.procesFase as ProcesFase, nodes);
      const newNode: ProcesNode = {
        id: nodeId,
        titel: formData.titel || '',
        korteBeschrijving: formData.korteBeschrijving || '',
        fase: formData.fase as Fase,
        klantreisStatus: formData.klantreisStatus as KlantreisStatus,
        procesFase: formData.procesFase as ProcesFase,
        primaireAfdeling: formData.primaireAfdeling as Afdeling,
        trigger: formData.trigger || '',
        inputs: formData.inputs || [],
        acties: formData.acties || [],
        outputs: formData.outputs || [],
        handovers: formData.handovers || [],
        uitzonderingen: formData.uitzonderingen || [],
        registraties: formData.registraties || [],
        reglementReferenties: formData.reglementReferenties || [],
        raci: formData.raci || [],
        versie: {
          versie: '1.0',
          eigenaar: 'ledenadministrateur',
          eigenaarAfdeling: formData.primaireAfdeling as Afdeling,
          aanmaakDatum: today,
          laatstGewijzigd: today,
          status: 'concept',
        },
      };
      addNode(newNode);
    }

    onClose();
  };

  const updateField = <K extends keyof ProcesNode>(field: K, value: ProcesNode[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            {editNode ? 'Processtap bewerken' : 'Nieuwe processtap aanmaken'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-4">
            {/* Titel */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Titel *
              </label>
              <input
                type="text"
                value={formData.titel || ''}
                onChange={(e) => updateField('titel', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Naam van de processtap"
                required
              />
            </div>

            {/* Korte beschrijving */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Korte beschrijving
              </label>
              <textarea
                value={formData.korteBeschrijving || ''}
                onChange={(e) => updateField('korteBeschrijving', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[80px]"
                placeholder="Beschrijf de processtap in het kort"
              />
            </div>

            {/* Fase - prominent bovenaan */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Fase *
              </label>
              <select
                value={formData.fase || 'bereiken'}
                onChange={(e) => updateField('fase', e.target.value as Fase)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {FASE_OPTIONS.map(option => (
                  <option key={option} value={option}>
                    {FASE_LABELS[option]}
                  </option>
                ))}
              </select>
            </div>

            {/* Dropdowns row 1 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Klantreis status *
                </label>
                <select
                  value={formData.klantreisStatus || 'lead'}
                  onChange={(e) => updateField('klantreisStatus', e.target.value as KlantreisStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {KLANTREIS_OPTIONS.map(option => (
                    <option key={option} value={option}>
                      {KLANTREIS_LABELS[option]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Procesfase *
                </label>
                <select
                  value={formData.procesFase || 'leadgeneratie'}
                  onChange={(e) => updateField('procesFase', e.target.value as ProcesFase)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PROCESFASE_OPTIONS.map(option => (
                    <option key={option} value={option}>
                      {PROCESFASE_LABELS[option]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Afdeling */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Primaire afdeling *
              </label>
              <select
                value={formData.primaireAfdeling || 'sales'}
                onChange={(e) => updateField('primaireAfdeling', e.target.value as Afdeling)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {AFDELING_OPTIONS.map(option => (
                  <option key={option} value={option}>
                    {AFDELING_LABELS[option]}
                  </option>
                ))}
              </select>
            </div>

            {/* Trigger */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Trigger
              </label>
              <textarea
                value={formData.trigger || ''}
                onChange={(e) => updateField('trigger', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[60px]"
                placeholder="Wat triggert deze processtap?"
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
              {editNode ? 'Opslaan' : 'Aanmaken'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
