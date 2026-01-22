import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { FilterOptie } from '../../types/filterConfig';

interface FilterOptieDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (optie: FilterOptie) => void;
  optie?: FilterOptie | null;
  bestaandeIds: string[];
  toonKleur?: boolean;
  toonBeschrijving?: boolean;
}

export default function FilterOptieDialog({
  isOpen,
  onClose,
  onSave,
  optie,
  bestaandeIds,
  toonKleur = true,
  toonBeschrijving = false,
}: FilterOptieDialogProps) {
  const [formData, setFormData] = useState<FilterOptie>({
    id: '',
    label: '',
    beschrijving: '',
    kleur: '#E3F2FD',
    volgorde: 999,
    actief: true,
  });
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!optie;

  useEffect(() => {
    if (isOpen) {
      if (optie) {
        setFormData(optie);
      } else {
        setFormData({
          id: '',
          label: '',
          beschrijving: '',
          kleur: '#E3F2FD',
          volgorde: 999,
          actief: true,
        });
      }
      setError(null);
    }
  }, [isOpen, optie]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validatie
    if (!formData.id.trim()) {
      setError('ID is verplicht');
      return;
    }

    if (!formData.label.trim()) {
      setError('Label is verplicht');
      return;
    }

    // ID mag alleen letters, cijfers en streepjes bevatten
    if (!/^[a-z0-9-]+$/.test(formData.id)) {
      setError('ID mag alleen kleine letters, cijfers en streepjes bevatten');
      return;
    }

    // Controleer of ID al bestaat (alleen bij nieuw)
    if (!isEditMode && bestaandeIds.includes(formData.id)) {
      setError('Dit ID bestaat al');
      return;
    }

    onSave(formData);
    onClose();
  };

  const generateIdFromLabel = () => {
    if (!formData.label) return;
    const id = formData.label
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    setFormData(prev => ({ ...prev, id }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditMode ? 'Optie bewerken' : 'Nieuwe optie'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Label */}
            <div>
              <label htmlFor="optie-label" className="block text-sm font-medium text-gray-700 mb-1">
                Label *
              </label>
              <input
                id="optie-label"
                type="text"
                value={formData.label}
                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                onBlur={() => !isEditMode && !formData.id && generateIdFromLabel()}
                placeholder="Weergavenaam"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>

            {/* ID */}
            <div>
              <label htmlFor="optie-id" className="block text-sm font-medium text-gray-700 mb-1">
                ID * <span className="text-gray-400 font-normal">(technisch, niet wijzigbaar na aanmaken)</span>
              </label>
              <input
                id="optie-id"
                type="text"
                value={formData.id}
                onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value.toLowerCase() }))}
                placeholder="unieke-id"
                disabled={isEditMode}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isEditMode ? 'bg-gray-100 text-gray-500' : ''
                }`}
              />
            </div>

            {/* Beschrijving */}
            {toonBeschrijving && (
              <div>
                <label htmlFor="optie-beschrijving" className="block text-sm font-medium text-gray-700 mb-1">
                  Beschrijving
                </label>
                <input
                  id="optie-beschrijving"
                  type="text"
                  value={formData.beschrijving || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, beschrijving: e.target.value }))}
                  placeholder="Optionele beschrijving"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Kleur */}
            {toonKleur && (
              <div>
                <label htmlFor="optie-kleur" className="block text-sm font-medium text-gray-700 mb-1">
                  Kleur
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="optie-kleur"
                    type="color"
                    value={formData.kleur || '#E3F2FD'}
                    onChange={(e) => setFormData(prev => ({ ...prev, kleur: e.target.value }))}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.kleur || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, kleur: e.target.value }))}
                    placeholder="#E3F2FD"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Actief */}
            <div className="flex items-center gap-2">
              <input
                id="optie-actief"
                type="checkbox"
                checked={formData.actief}
                onChange={(e) => setFormData(prev => ({ ...prev, actief: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="optie-actief" className="text-sm text-gray-700">
                Actief (zichtbaar in filters)
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuleren
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save size={16} />
              {isEditMode ? 'Opslaan' : 'Toevoegen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
