import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Play, Link } from 'lucide-react';
import type { DecisionNode } from '../../../types/decisionFlowchart';

export interface StartNodeData extends Record<string, unknown> {
  decisionNode: DecisionNode;
  onShowConnectionMenu?: (nodeId: string, handleType: 'source' | 'ja' | 'nee') => void;
}

interface StartNodeProps {
  data: StartNodeData;
  selected?: boolean;
}

function StartNode({ data, selected }: StartNodeProps) {
  const node = data.decisionNode;

  return (
    <>
      <Handle
        type="source"
        position={Position.Bottom}
        id="source"
        className="!w-3 !h-3 !bg-green-500 !border-2 !border-white"
      />
      <div
        className={`px-4 py-3 rounded-full bg-green-500 text-white shadow-md min-w-[100px] text-center transition-all ${
          selected ? 'ring-2 ring-green-300 ring-offset-2' : ''
        }`}
      >
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center justify-center gap-2">
            <Play size={16} />
            <span className="font-semibold text-sm">
              {node.titel || 'Start'}
            </span>
          </div>

          {/* Link knop voor verbinding maken */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              data.onShowConnectionMenu?.(node.id, 'source');
            }}
            className="flex items-center gap-1 px-2 py-1 bg-green-50 hover:bg-green-100 text-green-600 text-xs rounded border border-green-200 transition-colors"
            title="Verbinden met andere stap"
          >
            <Link size={10} />
            <span>Verbinden</span>
          </button>
        </div>
      </div>
    </>
  );
}

export default memo(StartNode);
