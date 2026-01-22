import { useState } from 'react';
import { Plus, Edit2, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import type { FilterOptie, FilterCategorieId } from '../../types/filterConfig';
import { useFilterConfigStore } from '../../store/useFilterConfigStore';
import { useStore } from '../../store/useStore';
import { isOptieInGebruik } from '../../lib/filterConfigStorage';
import FilterOptieDialog from './FilterOptieDialog';
import { ConfirmDialog } from '../dialogs';

interface FilterCategorieEditorProps {
  categorieId: FilterCategorieId;
  toonKleur?: boolean;
  toonBeschrijving?: boolean;
}

export default function FilterCategorieEditor({
  categorieId,
  toonKleur = true,
  toonBeschrijving = false,
}: FilterCategorieEditorProps) {
  const config = useFilterConfigStore((state) => state.config);
  const addOptie = useFilterConfigStore((state) => state.addOptie);
  const updateOptie = useFilterConfigStore((state) => state.updateOptie);
  const deleteOptie = useFilterConfigStore((state) => state.deleteOptie);
  const reorderOpties = useFilterConfigStore((state) => state.reorderOpties);
  const nodes = useStore((state) => state.nodes);

  const categorie = config[categorieId];
  const sortedOpties = [...categorie.opties].sort((a, b) => a.volgorde - b.volgorde);

  const [isExpanded, setIsExpanded] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOptie, setEditingOptie] = useState<FilterOptie | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<FilterOptie | null>(null);

  const handleAddOptie = () => {
    setEditingOptie(null);
    setDialogOpen(true);
  };

  const handleEditOptie = (optie: FilterOptie) => {
    setEditingOptie(optie);
    setDialogOpen(true);
  };

  const handleSaveOptie = (optie: FilterOptie) => {
    if (editingOptie) {
      updateOptie(categorieId, editingOptie.id, optie);
    } else {
      // Bepaal volgende volgorde nummer
      const maxVolgorde = Math.max(0, ...categorie.opties.map(o => o.volgorde));
      addOptie(categorieId, { ...optie, volgorde: maxVolgorde + 1 });
    }
  };

  const handleDeleteOptie = (optie: FilterOptie) => {
    // Check of optie in gebruik is
    if (isOptieInGebruik(categorieId, optie.id, nodes)) {
      setDeleteConfirm(optie);
    } else {
      deleteOptie(categorieId, optie.id);
    }
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteOptie(categorieId, deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const moveOptie = (index: number, direction: 'up' | 'down') => {
    const newOpties = [...sortedOpties];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newOpties.length) return;

    [newOpties[index], newOpties[targetIndex]] = [newOpties[targetIndex], newOpties[index]];
    reorderOpties(categorieId, newOpties.map(o => o.id));
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-900">{categorie.naam}</h3>
          <span className="text-sm text-gray-500">
            ({categorie.opties.filter(o => o.actief).length} actief)
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp size={20} className="text-gray-400" />
        ) : (
          <ChevronDown size={20} className="text-gray-400" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {categorie.beschrijving && (
            <p className="px-4 py-2 text-sm text-gray-500 bg-gray-50">
              {categorie.beschrijving}
            </p>
          )}

          {/* Opties lijst */}
          <div className="divide-y divide-gray-100">
            {sortedOpties.map((optie, index) => (
              <div
                key={optie.id}
                className={`flex items-center gap-3 px-4 py-3 ${
                  !optie.actief ? 'bg-gray-50 opacity-60' : ''
                }`}
              >
                {/* Drag handle placeholder */}
                <GripVertical size={16} className="text-gray-300" />

                {/* Kleur indicator */}
                {optie.kleur && (
                  <div
                    className="w-6 h-6 rounded border border-gray-200 flex-shrink-0"
                    style={{ backgroundColor: optie.kleur }}
                  />
                )}

                {/* Label en info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{optie.label}</span>
                    {!optie.actief && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                        inactief
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">ID: {optie.id}</div>
                  {optie.beschrijving && (
                    <div className="text-sm text-gray-500">{optie.beschrijving}</div>
                  )}
                </div>

                {/* Volgorde knoppen */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveOptie(index, 'up')}
                    disabled={index === 0}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Omhoog"
                  >
                    <ChevronUp size={14} className="text-gray-500" />
                  </button>
                  <button
                    onClick={() => moveOptie(index, 'down')}
                    disabled={index === sortedOpties.length - 1}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Omlaag"
                  >
                    <ChevronDown size={14} className="text-gray-500" />
                  </button>
                </div>

                {/* Acties */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditOptie(optie)}
                    className="p-2 hover:bg-blue-50 rounded text-blue-600 transition-colors"
                    title="Bewerken"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteOptie(optie)}
                    className="p-2 hover:bg-red-50 rounded text-red-600 transition-colors"
                    title="Verwijderen"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Toevoegen knop */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleAddOptie}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus size={16} />
              Nieuwe optie toevoegen
            </button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <FilterOptieDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveOptie}
        optie={editingOptie}
        bestaandeIds={categorie.opties.map(o => o.id)}
        toonKleur={toonKleur}
        toonBeschrijving={toonBeschrijving}
      />

      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Optie verwijderen"
        message={`De optie "${deleteConfirm?.label}" wordt nog gebruikt door processtappen. Weet je zeker dat je deze wilt verwijderen? Dit kan problemen veroorzaken.`}
        confirmLabel="Toch verwijderen"
        confirmVariant="danger"
      />
    </div>
  );
}
