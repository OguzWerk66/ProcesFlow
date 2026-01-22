import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap, Link } from 'lucide-react';
import type { DecisionNode } from '../../../types/decisionFlowchart';
import { useAfdelingKleuren, useAfdelingLabels } from '../../../store/useFilterConfigStore';

export interface ActionNodeData extends Record<string, unknown> {
  decisionNode: DecisionNode;
  onShowConnectionMenu?: (nodeId: string, handleType: 'source' | 'ja' | 'nee') => void;
}

interface ActionNodeProps {
  data: ActionNodeData;
  selected?: boolean;
}

function ActionNode({ data, selected }: ActionNodeProps) {
  const node = data.decisionNode;
  const afdelingKleuren = useAfdelingKleuren();
  const afdelingLabels = useAfdelingLabels();

  // Achtergrondkleur gebaseerd op afdeling
  const bgColor = node.afdeling && afdelingKleuren[node.afdeling]
    ? afdelingKleuren[node.afdeling]
    : '#E3F2FD';

  const afdelingLabel = node.afdeling ? afdelingLabels[node.afdeling] : null;

  return (
    <>
      {/* Inkomende verbinding */}
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
      />

      <div
        className={`px-4 py-3 rounded-lg shadow-md border-2 border-blue-400 min-w-[160px] max-w-[200px] transition-all ${
          selected ? 'ring-2 ring-blue-300 ring-offset-2' : ''
        }`}
        style={{ backgroundColor: bgColor }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Zap size={14} className="text-blue-600" />
          <span className="text-xs text-blue-600 font-medium">Actie</span>
        </div>

        <h3 className="font-semibold text-sm text-slate-800 leading-tight mb-1">
          {node.titel || 'Actie'}
        </h3>

        {node.beschrijving && (
          <p className="text-xs text-slate-600 line-clamp-2 mb-1">
            {node.beschrijving}
          </p>
        )}

        {/* Link knop voor verbinding maken */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onShowConnectionMenu?.(node.id, 'source');
          }}
          className="flex items-center gap-1 mt-2 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs rounded border border-blue-200 transition-colors"
          title="Verbinden met andere stap"
        >
          <Link size={10} />
          <span>Verbinden</span>
        </button>

        {afdelingLabel && (
          <div className="text-[10px] text-slate-500 mt-1 pt-1 border-t border-slate-200">
            {afdelingLabel}
          </div>
        )}
      </div>

      {/* Uitgaande verbinding */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="source"
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
      />
    </>
  );
}

export default memo(ActionNode);
