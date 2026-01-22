import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { ProcesNode } from '../../types';
import { AFDELING_KLEUREN, AFDELING_LABELS, KLANTREIS_LABELS, FASE_KLEUREN } from '../../types';

export interface ProcessNodeData extends Record<string, unknown> {
  procesNode: ProcesNode;
  [key: string]: unknown;
}

interface ProcessNodeProps {
  data: ProcessNodeData;
  selected?: boolean;
}

function ProcessNode({ data, selected }: ProcessNodeProps) {
  const node = data.procesNode;
  const bgColor = AFDELING_KLEUREN[node.primaireAfdeling] || '#f3f4f6';
  const borderColor = FASE_KLEUREN[node.fase] || '#3b82f6';

  return (
    <>
      {/* Onzichtbare handles voor edge rendering - alleen nodig voor ReactFlow internals */}
      <Handle
        type="target"
        position={Position.Left}
        id="target"
        className="!w-0 !h-0 !bg-transparent !border-0 !min-w-0 !min-h-0"
        isConnectable={false}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="source"
        className="!w-0 !h-0 !bg-transparent !border-0 !min-w-0 !min-h-0"
        isConnectable={false}
      />
      <div
        className={`px-3 py-2 rounded-lg shadow-sm border-2 min-w-[180px] max-w-[220px] transition-all ${
          selected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
        }`}
        style={{
          backgroundColor: bgColor,
          borderColor: borderColor
        }}
      >
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded"
            style={{ backgroundColor: borderColor + '20', color: borderColor }}
          >
            {KLANTREIS_LABELS[node.klantreisStatus]}
          </span>
          <span className="text-[10px] text-slate-500">
            {node.id}
          </span>
        </div>

        <h3 className="font-semibold text-sm text-slate-800 leading-tight mb-1">
          {node.titel}
        </h3>

        <p className="text-[11px] text-slate-600 line-clamp-2 mb-1.5">
          {node.korteBeschrijving}
        </p>

        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-500">
            {AFDELING_LABELS[node.primaireAfdeling]}
          </span>
          {node.doorlooptijd && (
            <span className="text-slate-400">
              {node.doorlooptijd.standaard}
            </span>
          )}
        </div>
      </div>
    </>
  );
}

export default memo(ProcessNode);
