import { useEffect, useState } from 'react';
import { X, FolderOpen, Trash2, Calendar, Layers, GitBranch } from 'lucide-react';
import { useDecisionFlowchartStore } from '../../store/useDecisionFlowchartStore';
import ConfirmDialog from './ConfirmDialog';
import type { DecisionFlowchartMetadata } from '../../types/decisionFlowchart';

interface DecisionFlowchartArchiveDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DecisionFlowchartArchiveDialog({ isOpen, onClose }: DecisionFlowchartArchiveDialogProps) {
  const flowchartList = useDecisionFlowchartStore((state) => state.flowchartList);
  const activeFlowchartId = useDecisionFlowchartStore((state) => state.activeFlowchartId);
  const loadFlowchartList = useDecisionFlowchartStore((state) => state.loadFlowchartList);
  const loadFlowchart = useDecisionFlowchartStore((state) => state.loadFlowchart);
  const deleteFlowchart = useDecisionFlowchartStore((state) => state.deleteFlowchart);

  const [flowchartToDelete, setFlowchartToDelete] = useState<DecisionFlowchartMetadata | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadFlowchartList();
    }
  }, [isOpen, loadFlowchartList]);

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
    loadFlowchart(id);
    onClose();
  };

  const handleDeleteConfirm = () => {
    if (flowchartToDelete) {
      deleteFlowchart(flowchartToDelete.id);
      setFlowchartToDelete(null);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FolderOpen size={20} className="text-purple-600" />
              Decision Flowchart Archief
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {flowchartList.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <GitBranch size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Geen opgeslagen flowcharts</p>
                <p className="text-sm mt-1">Sla je eerste decision flowchart op om het hier te zien.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {flowchartList
                  .sort((a, b) => new Date(b.laatstGewijzigd).getTime() - new Date(a.laatstGewijzigd).getTime())
                  .map((flowchart) => (
                    <div
                      key={flowchart.id}
                      className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                        flowchart.id === activeFlowchartId ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {flowchart.naam}
                            </h3>
                            {flowchart.id === activeFlowchartId && (
                              <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                                Actief
                              </span>
                            )}
                          </div>
                          {flowchart.beschrijving && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {flowchart.beschrijving}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              {formatDate(flowchart.laatstGewijzigd)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Layers size={12} />
                              {flowchart.nodeCount} stappen, {flowchart.edgeCount} verbindingen
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleLoad(flowchart.id)}
                            disabled={flowchart.id === activeFlowchartId}
                            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                              flowchart.id === activeFlowchartId
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-purple-600 text-white hover:bg-purple-700'
                            }`}
                          >
                            Openen
                          </button>
                          <button
                            onClick={() => setFlowchartToDelete(flowchart)}
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
        isOpen={flowchartToDelete !== null}
        title="Flowchart verwijderen"
        message={`Weet je zeker dat je "${flowchartToDelete?.naam}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`}
        confirmLabel="Verwijderen"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onClose={() => setFlowchartToDelete(null)}
      />
    </>
  );
}
