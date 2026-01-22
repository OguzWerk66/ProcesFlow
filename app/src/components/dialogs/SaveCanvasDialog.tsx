import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface SaveCanvasDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SaveCanvasDialog({ isOpen, onClose }: SaveCanvasDialogProps) {
  const { activeCanvasId, activeCanvasName, canvasList, saveCanvas, saveCanvasAs } = useStore();

  const [naam, setNaam] = useState('');
  const [beschrijving, setBeschrijving] = useState('');
  const [saveMode, setSaveMode] = useState<'update' | 'new'>('new');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (activeCanvasId && activeCanvasName) {
        setNaam(activeCanvasName);
        setSaveMode('update');
        const existingCanvas = canvasList.find(c => c.id === activeCanvasId);
        setBeschrijving(existingCanvas?.beschrijving || '');
      } else {
        setNaam('');
        setBeschrijving('');
        setSaveMode('new');
      }
      setError('');
    }
  }, [isOpen, activeCanvasId, activeCanvasName, canvasList]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!naam.trim()) {
      setError('Naam is verplicht');
      return;
    }

    // Check voor dubbele naam bij nieuw canvas
    if (saveMode === 'new') {
      const exists = canvasList.some(
        c => c.naam.toLowerCase() === naam.trim().toLowerCase()
      );
      if (exists) {
        setError('Er bestaat al een canvas met deze naam');
        return;
      }
      saveCanvasAs(naam.trim(), beschrijving.trim() || undefined);
    } else {
      saveCanvas(naam.trim(), beschrijving.trim() || undefined);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Canvas opslaan</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {activeCanvasId && (
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
                    className="text-blue-600"
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
                    className="text-blue-600"
                  />
                  <span className="text-sm">Nieuw canvas</span>
                </label>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="canvas-naam" className="block text-sm font-medium text-gray-700 mb-1">
              Naam *
            </label>
            <input
              id="canvas-naam"
              type="text"
              value={naam}
              onChange={(e) => {
                setNaam(e.target.value);
                setError('');
              }}
              placeholder="Bijv. Proces Model v1.0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="canvas-beschrijving" className="block text-sm font-medium text-gray-700 mb-1">
              Beschrijving
            </label>
            <textarea
              id="canvas-beschrijving"
              value={beschrijving}
              onChange={(e) => setBeschrijving(e.target.value)}
              placeholder="Optionele beschrijving..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
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
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
