import { X, RotateCcw } from 'lucide-react';
import { useFilterConfigStore } from '../../store/useFilterConfigStore';
import FilterCategorieEditor from './FilterCategorieEditor';
import { ConfirmDialog } from '../dialogs';
import { useState } from 'react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminDashboard({ isOpen, onClose }: AdminDashboardProps) {
  const resetConfig = useFilterConfigStore((state) => state.resetConfig);
  const [resetConfirm, setResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    resetConfig();
    setResetConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-gray-100 rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white rounded-t-lg border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Beheerdersdashboard</h2>
            <p className="text-sm text-gray-500">Beheer de filteropties voor het procesmodel</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setResetConfirm(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Reset naar standaard"
            >
              <RotateCcw size={16} />
              Reset
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <FilterCategorieEditor
            categorieId="fases"
            toonKleur={true}
            toonBeschrijving={true}
          />

          <FilterCategorieEditor
            categorieId="klantreisStatussen"
            toonKleur={true}
            toonBeschrijving={false}
          />

          <FilterCategorieEditor
            categorieId="procesFases"
            toonKleur={false}
            toonBeschrijving={false}
          />

          <FilterCategorieEditor
            categorieId="afdelingen"
            toonKleur={true}
            toonBeschrijving={false}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 bg-white rounded-b-lg border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sluiten
          </button>
        </div>
      </div>

      {/* Reset bevestiging */}
      <ConfirmDialog
        isOpen={resetConfirm}
        onClose={() => setResetConfirm(false)}
        onConfirm={handleReset}
        title="Reset naar standaard"
        message="Weet je zeker dat je alle filteropties wilt resetten naar de standaardwaarden? Alle aangepaste opties gaan verloren."
        confirmLabel="Resetten"
        confirmVariant="danger"
      />
    </div>
  );
}
