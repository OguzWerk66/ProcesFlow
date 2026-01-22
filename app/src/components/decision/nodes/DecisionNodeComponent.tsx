import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { HelpCircle, Link } from 'lucide-react';
import type { DecisionNode } from '../../../types/decisionFlowchart';
import { useAfdelingKleuren, useAfdelingLabels } from '../../../store/useFilterConfigStore';

export interface DecisionNodeData extends Record<string, unknown> {
  decisionNode: DecisionNode;
  onShowConnectionMenu?: (nodeId: string, handleType: 'source' | 'ja' | 'nee') => void;
}

interface DecisionNodeComponentProps {
  data: DecisionNodeData;
  selected?: boolean;
}

function DecisionNodeComponent({ data, selected }: DecisionNodeComponentProps) {
  const node = data.decisionNode;
  const afdelingKleuren = useAfdelingKleuren();
  const afdelingLabels = useAfdelingLabels();

  // Achtergrondkleur: afdeling kleur of default geel
  const bgColor = node.afdeling && afdelingKleuren[node.afdeling]
    ? afdelingKleuren[node.afdeling]
    : '#FFC107';

  const afdelingLabel = node.afdeling ? afdelingLabels[node.afdeling] : null;

  return (
    <>
      {/* Inkomende verbinding - bovenkant */}
      <Handle
        type="target"
        position={Position.Top}
        id="target"
        className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white"
      />

      {/* Ruit/Diamond vorm via CSS transform */}
      <div
        className={`relative transition-all ${
          selected ? 'scale-105' : ''
        }`}
        style={{ width: '140px', height: '140px' }}
      >
        {/* De ruit zelf */}
        <div
          className={`absolute inset-0 shadow-md border-2 border-amber-600 ${
            selected ? 'ring-2 ring-amber-300 ring-offset-2' : ''
          }`}
          style={{
            backgroundColor: bgColor,
            transform: 'rotate(45deg)',
            borderRadius: '8px',
            top: '20px',
            left: '20px',
            width: '100px',
            height: '100px',
          }}
        />

        {/* Inhoud (niet geroteerd) */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-2"
        >
          <HelpCircle size={16} className="text-amber-700 mb-1" />
          <span className="text-xs font-semibold text-slate-800 leading-tight max-w-[90px] line-clamp-2">
            {node.vraag || node.titel || 'Vraag?'}
          </span>

          {/* Link knoppen voor ja/nee verbindingen */}
          <div className="flex gap-1 mt-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                data.onShowConnectionMenu?.(node.id, 'ja');
              }}
              className="flex items-center gap-1 px-1.5 py-0.5 bg-green-50 hover:bg-green-100 text-green-600 text-[10px] rounded border border-green-200 transition-colors"
              title="Ja → Verbinden met andere stap"
            >
              <Link size={8} />
              <span>Ja</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                data.onShowConnectionMenu?.(node.id, 'nee');
              }}
              className="flex items-center gap-1 px-1.5 py-0.5 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] rounded border border-red-200 transition-colors"
              title="Nee → Verbinden met andere stap"
            >
              <Link size={8} />
              <span>Nee</span>
            </button>
          </div>

          {afdelingLabel && (
            <span className="text-[10px] text-slate-600 mt-1 bg-white/70 px-1 rounded">
              {afdelingLabel}
            </span>
          )}
        </div>
      </div>

      {/* Ja uitgang - linkerkant */}
      <Handle
        type="source"
        position={Position.Left}
        id="ja"
        className="!w-3 !h-3 !bg-green-500 !border-2 !border-white"
        style={{ top: '50%' }}
      />

      {/* Nee uitgang - rechterkant */}
      <Handle
        type="source"
        position={Position.Right}
        id="nee"
        className="!w-3 !h-3 !bg-red-500 !border-2 !border-white"
        style={{ top: '50%' }}
      />
    </>
  );
}

export default memo(DecisionNodeComponent);
