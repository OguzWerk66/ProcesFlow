import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Layers } from 'lucide-react';
import type { DecisionNode } from '../../../types/decisionFlowchart';
import { useAfdelingKleuren, useAfdelingLabels } from '../../../store/useFilterConfigStore';

export interface SubprocessNodeData extends Record<string, unknown> {
  decisionNode: DecisionNode;
}

interface SubprocessNodeProps {
  data: SubprocessNodeData;
  selected?: boolean;
}

function SubprocessNode({ data, selected }: SubprocessNodeProps) {
  const node = data.decisionNode;
  const afdelingKleuren = useAfdelingKleuren();
  const afdelingLabels = useAfdelingLabels();

  // Achtergrondkleur gebaseerd op afdeling
  const bgColor = node.afdeling && afdelingKleuren[node.afdeling]
    ? afdelingKleuren[node.afdeling]
    : '#F3E5F5';

  const afdelingLabel = node.afdeling ? afdelingLabels[node.afdeling] : null;

  return (
    <>
      {/* Inkomende verbinding */}
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white"
      />

      {/* Dubbele rand effect voor subprocess */}
      <div
        className={`relative px-4 py-3 rounded-lg shadow-md min-w-[160px] max-w-[200px] transition-all ${
          selected ? 'ring-2 ring-purple-300 ring-offset-2' : ''
        }`}
        style={{ backgroundColor: bgColor }}
      >
        {/* Binnenste rand voor dubbel-rand effect */}
        <div
          className="absolute inset-1 border-2 border-purple-400 rounded pointer-events-none"
        />

        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Layers size={14} className="text-purple-600" />
            <span className="text-xs text-purple-600 font-medium">Subprocess</span>
          </div>

          <h3 className="font-semibold text-sm text-slate-800 leading-tight mb-1">
            {node.titel || 'Subprocess'}
          </h3>

          {node.beschrijving && (
            <p className="text-xs text-slate-600 line-clamp-2 mb-1">
              {node.beschrijving}
            </p>
          )}

          {afdelingLabel && (
            <div className="text-[10px] text-slate-500 mt-1 pt-1 border-t border-slate-200">
              {afdelingLabel}
            </div>
          )}

          {(node.linkedProcessId || node.linkedFlowchartId) && (
            <div className="text-[10px] text-purple-500 mt-1">
              Gekoppeld
            </div>
          )}
        </div>
      </div>

      {/* Uitgaande verbinding */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="source"
        className="!w-3 !h-3 !bg-purple-500 !border-2 !border-white"
      />
    </>
  );
}

export default memo(SubprocessNode);
