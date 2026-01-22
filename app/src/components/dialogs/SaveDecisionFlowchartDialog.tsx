import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useDecisionFlowchartStore } from '../../store/useDecisionFlowchartStore';

interface SaveDecisionFlowchartDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SaveDecisionFlowchartDialog({ isOpen, onClose }: SaveDecisionFlowchartDialogProps) {
  const activeFlowchartId = useDecisionFlowchartStore((state) => state.activeFlowchartId);
  const activeFlowchartName = useDecisionFlowchartStore((state) => state.activeFlowchartName);
  const flowchartList = useDecisionFlowchartStore((state) => state.flowchartList);
  const saveFlowchart = useDecisionFlowchartStore((state) => state.saveFlowchart);
  const saveFlowchartAs = useDecisionFlowchartStore((state) => state.saveFlowchartAs);

  const [naam, setNaam] = useState('');
  const [beschrijving, setBeschrijving] = useState('');
  const [saveMode, setSaveMode] = useState<'update' | 'new'>('new');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (activeFlowchartId && activeFlowchartName) {
        setNaam(activeFlowchartName);
        setSaveMode('update');
        const existingFlowchart = flowchartList.find(fc => fc.id === activeFlowchartId);
        setBeschrijving(existingFlowchart?.beschrijving || '');
      } else {
        setNaam('');
        setBeschrijving('');
        setSaveMode('new');
      }
      setError('');
    }
  }, [isOpen, activeFlowchartId, activeFlowchartName, flowchartList]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!naam.trim()) {
      setError('Naam is verplicht');
      return;
    }

    // Check voor dubbele naam bij nieuw flowchart
    if (saveMode === 'new') {
      const exists = flowchartList.some(
        fc => fc.naam.toLowerCase() === naam.trim().toLowerCase()
      );
      if (exists) {
        setError('Er bestaat al een flowchart met deze naam');
        return;
      }
      saveFlowchartAs(naam.trim(), beschrijving.trim() || undefined);
    } else {
      saveFlowchart(naam.trim(), beschrijving.trim() || undefined);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Decision Flowchart opslaan</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {activeFlowchartId && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Opslaan als
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="saveMode"
                    value="update"
                    checked={saveMode === 'update'}
                    onChange={() => setSaveMode('update')}
                    className="text-purple-600"
                  />
                  <span className="text-sm">Huidige overschrijven</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="saveMode"
                    value="new"
                    checked={saveMode === 'new'}
                    onChange={() => setSaveMode('new')}
                    className="text-purple-600"
                  />
                  <span className="text-sm">Nieuw flowchart</span>
                </label>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="flowchart-naam" className="block text-sm font-medium text-gray-700 mb-1">
              Naam *
            </label>
            <input
              id="flowchart-naam"
              type="text"
              value={naam}
              onChange={(e) => {
                setNaam(e.target.value);
                setError('');
              }}
              placeholder="Bijv. Aanvraag Goedkeuring Flowchart"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="flowchart-beschrijving" className="block text-sm font-medium text-gray-700 mb-1">
              Beschrijving
            </label>
            <textarea
              id="flowchart-beschrijving"
              value={beschrijving}
              onChange={(e) => setBeschrijving(e.target.value)}
              placeholder="Optionele beschrijving..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Annuleren
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Save size={18} />
              Opslaan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
