import { memo, useState } from 'react';
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
  const borderColor = FASE_KLEUREN[node.fase] || '#3b82f6';
  const afdelingColor = AFDELING_KLEUREN[node.primaireAfdeling] || '#3b82f6';
  const [hovered, setHovered] = useState(false);

  const tooltipText = node.uitgebreideBeschrijving || node.korteBeschrijving;

  return (
    <div style={{ position: 'relative' }}>
      {/* Onzichtbare handles voor edge rendering */}
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

      {/* Tooltip */}
      {hovered && tooltipText && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
          className="w-64 bg-gray-950 border border-gray-600 rounded-lg shadow-2xl px-3 py-2.5"
        >
          <p className="text-xs font-semibold text-gray-200 mb-1">{node.titel}</p>
          <p className="text-[11px] text-gray-300 leading-relaxed whitespace-pre-wrap">{tooltipText}</p>
          {node.acties && node.acties.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <p className="text-[10px] font-medium text-gray-400 mb-1">Acties</p>
              <ul className="space-y-0.5">
                {node.acties.slice(0, 4).map((actie, i) => (
                  <li key={i} className="text-[10px] text-gray-400 flex gap-1">
                    <span className="text-gray-600 shrink-0">•</span>
                    <span>{actie}</span>
                  </li>
                ))}
                {node.acties.length > 4 && (
                  <li className="text-[10px] text-gray-500">+{node.acties.length - 4} meer</li>
                )}
              </ul>
            </div>
          )}
          {/* Arrow */}
          <div
            style={{
              position: 'absolute',
              bottom: -5,
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: 10,
              height: 10,
            }}
            className="bg-gray-950 border-r border-b border-gray-600"
          />
        </div>
      )}

      <div
        className={`px-3 py-2 rounded-lg shadow-sm border-2 min-w-[180px] max-w-[220px] transition-all bg-gray-800 ${
          selected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-950' : ''
        }`}
        style={{ borderColor: borderColor }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded"
            style={{ backgroundColor: borderColor + '33', color: borderColor }}
          >
            {KLANTREIS_LABELS[node.klantreisStatus]}
          </span>
          <span className="text-[10px] text-gray-500">
            {node.id}
          </span>
        </div>

        <h3 className="font-semibold text-sm text-gray-100 leading-tight mb-1">
          {node.titel}
        </h3>

        <p className="text-[11px] text-gray-400 line-clamp-2 mb-1.5">
          {node.korteBeschrijving}
        </p>

        <div className="flex items-center justify-between text-[10px]">
          <span
            className="font-medium"
            style={{ color: afdelingColor }}
          >
            {AFDELING_LABELS[node.primaireAfdeling]}
          </span>
          {node.doorlooptijd && (
            <span className="text-gray-500">
              {node.doorlooptijd.standaard}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(ProcessNode);
