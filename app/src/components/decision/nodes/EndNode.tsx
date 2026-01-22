import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Square } from 'lucide-react';
import type { DecisionNode } from '../../../types/decisionFlowchart';

export interface EndNodeData extends Record<string, unknown> {
  decisionNode: DecisionNode;
}

interface EndNodeProps {
  data: EndNodeData;
  selected?: boolean;
}

function EndNode({ data, selected }: EndNodeProps) {
  const node = data.decisionNode;

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="!w-3 !h-3 !bg-red-500 !border-2 !border-white"
      />
      <div
        className={`px-4 py-3 rounded-full bg-red-500 text-white shadow-md min-w-[100px] text-center transition-all ${
          selected ? 'ring-2 ring-red-300 ring-offset-2' : ''
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <Square size={14} fill="white" />
          <span className="font-semibold text-sm">
            {node.titel || 'Einde'}
          </span>
        </div>
      </div>
    </>
  );
}

export default memo(EndNode);
