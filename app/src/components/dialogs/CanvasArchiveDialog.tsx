import { useEffect, useState } from 'react';
import { X, FolderOpen, Trash2, FileText, Calendar, Layers } from 'lucide-react';
import { useStore } from '../../store/useStore';
import ConfirmDialog from './ConfirmDialog';
import type { CanvasMetadata } from '../../types';

interface CanvasArchiveDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CanvasArchiveDialog({ isOpen, onClose }: CanvasArchiveDialogProps) {
  const { canvasList, activeCanvasId, loadCanvasList, loadCanvas, deleteCanvas } = useStore();

  const [canvasToDelete, setCanvasToDelete] = useState<CanvasMetadata | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCanvasList();
    }
  }, [isOpen, loadCanvasList]);

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleLoad = (id: string) => {
    loadCanvas(id);
    onClose();
  };

  const handleDeleteConfirm = () => {
    if (canvasToDelete) {
      deleteCanvas(canvasToDelete.id);
      setCanvasToDelete(null);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FolderOpen size={20} className="text-blue-600" />
              Canvas Archief
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {canvasList.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Geen opgeslagen canvassen</p>
                <p className="text-sm mt-1">Sla je eerste canvas op om het hier te zien.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {canvasList
                  .sort((a, b) => new Date(b.laatstGewijzigd).getTime() - new Date(a.laatstGewijzigd).getTime())
                  .map((canvas) => (
                    <div
                      key={canvas.id}
                      className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                        canvas.id === activeCanvasId ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {canvas.naam}
                            </h3>
                            {canvas.id === activeCanvasId && (
                              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                                Actief
                              </span>
                            )}
                          </div>
                          {canvas.beschrijving && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {canvas.beschrijving}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {formatDate(canvas.laatstGewijzigd)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Layers size={12} />
                              {canvas.nodeCount} stappen, {canvas.edgeCount} links
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleLoad(canvas.id)}
                            disabled={canvas.id === activeCanvasId}
                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                              canvas.id === activeCanvasId
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            Openen
                          </button>
                          <button
                            onClick={() => setCanvasToDelete(canvas)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Verwijderen"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="border-t p-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Sluiten
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={canvasToDelete !== null}
        title="Canvas verwijderen"
        message={`Weet je zeker dat je "${canvasToDelete?.naam}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`}
        confirmLabel="Verwijderen"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onClose={() => setCanvasToDelete(null)}
      />
    </>
  );
}
